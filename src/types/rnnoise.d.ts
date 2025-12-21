// Type definitions for @timephy/rnnoise-wasm
declare module '@timephy/rnnoise-wasm' {
  export const NoiseSuppressorWorklet_Name: string;
}

declare module '@timephy/rnnoise-wasm/NoiseSuppressorWorklet' {
  const workletUrl: string;
  export default workletUrl;
}

// Extend the Window interface to include the AudioWorklet interface
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }

  interface AudioContext {
    // @ts-ignore - Worklet types might not be available
    audioWorklet: {
      addModule(moduleURL: string): Promise<void>;
    };
  }

  interface AudioWorkletNodeOptions {
    processorOptions?: any;
  }

  class AudioWorkletNode extends AudioNode {
    constructor(context: BaseAudioContext, name: string, options?: AudioWorkletNodeOptions);
    port: MessagePort;
  }
}

export {};
