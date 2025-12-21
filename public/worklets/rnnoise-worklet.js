// RNNoise worklet implementation with fallback
class RNNoiseWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [];
  }

  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    this.initialized = false;
    this.module = null;
    this.processor = null;
    this.useFallback = false;
  }

  async handleMessage(event) {
    if (event.data.type === 'init') {
      try {
        // Try to load the WASM module
        const wasmResponse = await fetch('/worklets/rnnoise.wasm');
        
        if (!wasmResponse.ok) {
          throw new Error(`Failed to load WASM: ${wasmResponse.status} ${wasmResponse.statusText}`);
        }
        
        const wasmBuffer = await wasmResponse.arrayBuffer();
        
        try {
          // Try to instantiate the WASM module
          this.module = await WebAssembly.instantiate(wasmBuffer);
          
          // Check if the required exports are available
          if (this.module.instance.exports && 
              typeof this.module.instance.exports.init === 'function' &&
              typeof this.module.instance.exports.process_sample === 'function') {
            
            this.processor = this.module.instance.exports;
            this.processor.init();
            this.initialized = true;
            this.useFallback = false;
            
            console.log('RNNoise WASM initialized successfully');
            this.port.postMessage({ type: 'initialized' });
          } else {
            throw new Error('Invalid WASM module - missing required exports');
          }
        } catch (wasmError) {
          console.warn('Failed to initialize WASM, falling back to passthrough', wasmError);
          this.useFallback = true;
          this.port.postMessage({ 
            type: 'warning', 
            message: 'Using audio passthrough - WASM not available' 
          });
        }
      } catch (error) {
        console.error('Error loading WASM:', error);
        this.useFallback = true;
        this.port.postMessage({ 
          type: 'warning',
          message: 'Using audio passthrough - ' + (error.message || 'Failed to load WASM') 
        });
      }
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !output) {
      return true;
    }

    // If not initialized or using fallback, just pass through the audio
    if (!this.initialized || this.useFallback) {
      for (let channel = 0; channel < input.length; channel++) {
        const inputChannel = input[channel];
        const outputChannel = output[channel];
        
        if (inputChannel && outputChannel) {
          for (let i = 0; i < inputChannel.length; i++) {
            outputChannel[i] = inputChannel[i];
          }
        }
      }
      return true;
    }

    // Process with RNNoise if available
    try {
      for (let channel = 0; channel < input.length; channel++) {
        const inputChannel = input[channel];
        const outputChannel = output[channel];
        
        if (inputChannel && outputChannel) {
          for (let i = 0; i < inputChannel.length; i++) {
            // Process sample through RNNoise
            outputChannel[i] = this.processor.process_sample(inputChannel[i] * 32768) / 32768;
          }
        }
      }
    } catch (error) {
      console.error('Error in audio processing:', error);
      // Fall back to passthrough on error
      for (let channel = 0; channel < input.length; channel++) {
        const inputChannel = input[channel];
        const outputChannel = output[channel];
        
        if (inputChannel && outputChannel) {
          for (let i = 0; i < inputChannel.length; i++) {
            outputChannel[i] = inputChannel[i];
          }
        }
      }
      
      // Only send error once to avoid flooding
      if (!this.useFallback) {
        this.useFallback = true;
        this.port.postMessage({ 
          type: 'error', 
          error: 'Audio processing error, falling back to passthrough' 
        });
      }
    }

    return true;
  }
}

// Register the processor
registerProcessor('rnnoise-worklet', RNNoiseWorklet);
