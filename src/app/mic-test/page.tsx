'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Check } from 'lucide-react';
import { redoneStoreLocations } from '../agentConfigs/chatSupervisor/sampleData';

// Jitsi types
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    JitsiMeetJS: any; // Jitsi Meet JS API
  }
}

type NoiseSuppressionType = 'none' | 'jitsi';

// Jitsi noise suppression levels
const NOISE_SUPPRESSION_LEVELS = {
  none: 0,
  low: 0.1,
  moderate: 0.3,
  high: 0.7,
  very_high: 1.0
};

const MicTestPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState<NoiseSuppressionType>('jitsi');
  const [noiseSuppressionLevel, setNoiseSuppressionLevel] = useState<keyof typeof NOISE_SUPPRESSION_LEVELS>('moderate');
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [availableNoiseSuppressors] = useState<{
    [key in NoiseSuppressionType]: boolean;
  }>({
    none: true,
    jitsi: true
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);

  // Load Jitsi Meet JS API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadJitsi = async () => {
      try {
        // In a real app, you would load the Jitsi Meet API properly
        // This is a simplified example
        if (!window.JitsiMeetJS) {
          const script = document.createElement('script');
          script.src = 'https://meet.jit.si/libs/lib-jitsi-meet.min.js';
          script.async = true;
          script.onload = () => {
            try {
              // Initialize Jitsi with minimal configuration
              window.JitsiMeetJS.init({
                disableAudioLevels: false,
                disableSimulcast: true,
                enableNoiseSuppression: true,
                useIPv6: true,
                disableRtx: true,
                enableIceRestart: false,
                enableRemb: false,
                enableTcc: false,
                useTurnUdp: false
              });
              
              console.log('Jitsi Meet JS initialized successfully');
              setJitsiLoaded(true);
            } catch (error) {
              console.error('Error initializing Jitsi:', error);
            }
          };
          
          script.onerror = () => {
            console.error('Failed to load Jitsi Meet JS');
          };
          
          document.body.appendChild(script);
        } else {
          setJitsiLoaded(true);
        }
      } catch (error) {
        console.error('Error loading Jitsi:', error);
      }
    };

    loadJitsi();

    return () => {
      stopRecording();
    };
  }, []);

  // Initialize Jitsi when loaded
  useEffect(() => {
    if (!jitsiLoaded || !window.JitsiMeetJS) return;

    console.log('Jitsi Meet JS loaded');
    
    // List available devices using the browser's native API
    const listDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('Available devices:', devices);
      } catch (error) {
        console.warn('Could not enumerate devices:', error);
      }
    };

    listDevices();
  }, [jitsiLoaded]);

  // Create a noise gate effect
  const createNoiseGate = (audioContext: AudioContext, threshold = -50, attack = 0.1, release = 0.3) => {
    const thresholdValue = Math.pow(10, threshold / 20);
    let lastGainValue = 0;
    
    const gainNode = audioContext.createGain();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // Process audio in chunks
    const processAudio = () => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;
      
      // Simple noise gate
      const targetGain = avg > thresholdValue ? 1 : 0.01;
      
      // Smooth gain changes
      const now = audioContext.currentTime;
      const currentGain = gainNode.gain.value;
      
      if (targetGain > currentGain) {
        // Attack phase
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(currentGain, now);
        gainNode.gain.linearRampToValueAtTime(targetGain, now + attack);
      } else if (targetGain < currentGain) {
        // Release phase
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(currentGain, now);
        gainNode.gain.linearRampToValueAtTime(targetGain, now + release);
      }
      
      lastGainValue = targetGain;
      requestAnimationFrame(processAudio);
    };
    
    processAudio();
    
    return {
      input: analyser,
      output: gainNode,
      connect(destination: AudioNode) {
        analyser.connect(gainNode);
        gainNode.connect(destination);
      }
    };
  };

  const startRecording = async () => {
    try {
      // Get user media with default settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true
        },
        video: false 
      });
      
      mediaStreamRef.current = stream;
      
      // Set up audio context for processing and visualization
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      // Create audio nodes
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Create a high-pass filter to remove low-frequency noise
      const highPassFilter = audioContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 150; // Cut off frequencies below 150Hz
      
      // Create noise gate
      const noiseGate = createNoiseGate(audioContext, -50, 0.1, 0.3);
      
      // Connect nodes: Source -> High Pass -> Noise Gate -> Analyser -> Destination
      source.connect(highPassFilter);
      highPassFilter.connect(noiseGate.input);
      noiseGate.connect(analyser);
      
      // Create a destination for the processed audio
      const destination = audioContext.createMediaStreamDestination();
      analyser.connect(destination);
      
      // Also connect to the audio context's destination for monitoring
      analyser.connect(audioContext.destination);
      
      // Update the audio element with the processed stream for monitoring
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = destination.stream;
      }

      // Set up volume analysis
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const analyze = () => {
        if (!isRecording) return;
        
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(avg / 255);
        
        animationRef.current = requestAnimationFrame(analyze);
      };

      // Start audio context if it's in suspended state
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Start audio playback in the audio element
      if (audioElementRef.current) {
        audioElementRef.current.play().catch(e => {
          console.warn('Audio playback failed:', e);
        });
      }

      setIsRecording(true);
      analyze(); // Start the analysis loop
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure you have granted microphone permissions.');
      stopRecording();
    }
  };

  const applyNoiseSuppression = async (
    stream: MediaStream,
    type: NoiseSuppressionType
  ): Promise<MediaStream> => {
    // If Jitsi is not loaded or no noise suppression requested, return original stream
    if (!window.JitsiMeetJS || !jitsiLoaded || type === 'none') {
      console.log('Using original stream without noise suppression');
      return stream;
    }
    
    // Ensure we have a valid audio track
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn('No audio tracks in stream');
      return stream;
    }

    const audioTrack = audioTracks[0];
    
    try {
      console.log('Creating Jitsi track with noise suppression');
      
      // Create a new audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a source node from the original stream
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create a destination node
      const destination = audioContext.createMediaStreamDestination();
      
      // Connect source to destination (this is where we would apply effects)
      source.connect(destination);
      
      // Create a new stream with the destination stream
      const newStream = new MediaStream([...destination.stream.getAudioTracks()]);
      
      // Clean up the original track
      audioTrack.stop();
      
      return newStream;
      
    } catch (error) {
      console.error('Error applying noise suppression:', error);
      
      // If we have an error, clean up and return the original stream
      try {
        const newStream = new MediaStream([audioTrack]);
        return newStream;
      } catch (e) {
        console.error('Error creating fallback stream:', e);
        return stream;
      }
    }
  };

  const stopRecording = () => {
    if (animationRef.current !== undefined) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    setIsRecording(false);
    setVolume(0);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const animate = () => {
    // This function is called repeatedly to update the UI
    if (!isRecording) return;
    
    // Update volume visualization here if needed
    
    animationRef.current = requestAnimationFrame(animate);
    return undefined; // Explicitly return undefined to match the expected type
  };

  const handleNoiseSuppressionChange = (type: NoiseSuppressionType) => {
    setNoiseSuppression(type);
    if (isRecording) {
      stopRecording();
      startRecording();
    }
  };
  console.log(redoneStoreLocations)
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Microphone Test</h1>
        
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Audio Input</h2>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {showSettings && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Noise Suppression</h3>
              <div className="space-y-2">
            {Object.entries(availableNoiseSuppressors).map(([key, isAvailable]) => (
              isAvailable && (
                <div key={key}>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="noiseSuppression"
                      checked={noiseSuppression === key}
                      onChange={() => handleNoiseSuppressionChange(key as NoiseSuppressionType)}
                      className="form-radio h-4 w-4 text-blue-600"
                      disabled={key === 'jitsi' && !jitsiLoaded}
                    />
                    <span className="text-gray-700 capitalize">
                      {key === 'none' ? 'None' : 'Jitsi Noise Suppression'}
                      {noiseSuppression === key && <Check className="inline-block w-4 h-4 ml-1 text-green-500" />}
                      {key === 'jitsi' && !jitsiLoaded && (
                        <span className="ml-2 text-xs text-yellow-600">(Loading...)</span>
                      )}
                    </span>
                  </label>
                  
                  {key === 'jitsi' && noiseSuppression === 'jitsi' && (
                    <div className="ml-6 mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Suppression Level</label>
                      <select
                        value={noiseSuppressionLevel}
                        onChange={(e) => setNoiseSuppressionLevel(e.target.value as keyof typeof NOISE_SUPPRESSION_LEVELS)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        {Object.entries(NOISE_SUPPRESSION_LEVELS).map(([level, _]) => (
                          <option key={level} value={level}>
                            {level.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )
            ))}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <button
              onClick={toggleRecording}
              className={`p-4 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white shadow-lg transition-all duration-200 transform hover:scale-105`}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            
            <div className="mt-6 w-full max-w-xs">
              <div className="flex items-center justify-between mb-1">
                <VolumeX className="text-gray-500 w-5 h-5" />
                <span className="text-sm text-gray-600">Input Level</span>
                <Volume2 className="text-gray-500 w-5 h-5" />
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ 
                    width: `${Math.min(100, volume * 100)}%`,
                    backgroundColor: isRecording 
                      ? volume > 0.8 ? '#ef4444' : '#3b82f6' 
                      : '#9ca3af'
                  }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              {isRecording 
                ? 'Recording... Speak into your microphone' 
                : 'Click the microphone to start testing'}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Audio Output</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <audio 
              ref={audioElementRef} 
              controls 
              className="w-full"
              autoPlay 
              playsInline
              muted={!isRecording}
            />
            <p className="mt-2 text-sm text-gray-500">
              {isRecording 
                ? 'Live monitoring (your voice may have a slight delay)'
                : 'Recording audio will appear here'}
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Tips for Best Results</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use headphones to prevent audio feedback</li>
            <li>• Test different noise suppression methods to find what works best in your environment</li>
            <li>• Ensure you've granted microphone permissions in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MicTestPage;
