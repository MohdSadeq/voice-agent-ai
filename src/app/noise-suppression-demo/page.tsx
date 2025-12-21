'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function NoiseSuppressionDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuppressionEnabled, setIsSuppressionEnabled] = useState(true);
  const [suppressionLevel, setSuppressionLevel] = useState(0.7);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const noiseSuppressionProcessor = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  // Load the noise suppression script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@shiguredo/noise-suppression@latest/dist/noise_suppression.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Noise suppression script loaded');
    };
    
    script.onerror = () => {
      console.error('Failed to load noise suppression script');
    };
    
    document.body.appendChild(script);
    
    return () => {
      stopRecording();
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      const script = document.querySelector('script[src*="noise_suppression"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [recordedAudioUrl]);

  const startRecording = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // We'll handle noise suppression ourselves
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 16000
        },
        video: false
      });

      mediaStreamRef.current = stream;
      
      // Get the audio track
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) throw new Error('No audio track available');

      // Set up audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      // Create analyser for visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      let processedStream: MediaStream;

      if (isSuppressionEnabled && window.NoiseSuppressionProcessor) {
        try {
          // Initialize noise suppression from global object
          noiseSuppressionProcessor.current = new window.NoiseSuppressionProcessor();
          
          // Process the audio track
          const processedTrack = await noiseSuppressionProcessor.current.startProcessing(audioTrack);
          
          // Create a new stream with the processed track
          processedStream = new MediaStream([processedTrack]);
          
          // Create source from processed stream
          const source = audioContext.createMediaStreamSource(processedStream);
          
          // Connect for monitoring
          source.connect(analyser);
          analyser.connect(audioContext.destination);
          
        } catch (error) {
          console.error('Error initializing noise suppression:', error);
          // Fallback to direct connection if noise suppression fails
          processedStream = new MediaStream([audioTrack]);
          const source = audioContext.createMediaStreamSource(processedStream);
          source.connect(analyser);
          analyser.connect(audioContext.destination);
        }
      } else {
        // Direct connection without noise suppression
        processedStream = new MediaStream([audioTrack]);
        const source = audioContext.createMediaStreamSource(processedStream);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      
      // Set up volume meter
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const analyze = () => {
        if (!isRecording) return;
        
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setVolume(avg / 255);
        
        animationRef.current = requestAnimationFrame(analyze);
      };
      
      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(processedStream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecordingAudio(true);
      
      // Update audio element for monitoring
      if (audioElementRef.current) {
        audioElementRef.current.srcObject = processedStream;
        audioElementRef.current.play().catch(e => {
          console.warn('Audio playback failed:', e);
        });
      }
      
      setIsRecording(true);
      analyze();
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure you have granted microphone permissions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    // Stop media recorder if it's recording
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    
    // Stop noise suppression
    if (noiseSuppressionProcessor.current) {
      noiseSuppressionProcessor.current.stopProcessing();
      noiseSuppressionProcessor.current = null;
    }
    
    // Stop all media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    // Clear audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }
    
    setIsRecording(false);
    setVolume(0);
  };
  
  const downloadRecording = () => {
    if (!recordedAudioUrl) return;
    
    const a = document.createElement('a');
    a.href = recordedAudioUrl;
    a.download = `recording-${new Date().toISOString()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const downloadAudio = () => {
    if (!mediaStreamRef.current) return;
    
    const audioTracks = mediaStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) return;
    
    const audioTrack = audioTracks[0];
    const mediaRecorder = new MediaRecorder(new MediaStream([audioTrack]));
    const audioChunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${new Date().toISOString()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 1000); // Record for 1 second
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Noise Suppression Demo</h1>
          <p className="text-gray-600 mb-6">Test the noise suppression in real-time with your microphone</p>
        
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isRecording ? 'Recording...' : 'Ready to record'}
                {isProcessing && ' (Initializing...)'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5 text-gray-600" />
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-100"
                  style={{ width: `${Math.round(volume * 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Main Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`flex-1 w-full sm:w-auto flex items-center justify-center space-x-2 py-3 text-base ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100' 
                  : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-100'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span>{isProcessing ? 'Starting...' : 'Start Recording'}</span>
                </>
              )}
            </Button>
            
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button
                onClick={downloadRecording}
                disabled={!recordedAudioUrl}
                variant="outline"
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-3"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setIsSuppressionEnabled(!isSuppressionEnabled)}
                className={`flex items-center justify-center px-4 py-3 ${
                  isSuppressionEnabled 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-gray-50 text-gray-600'
                }`}
              >
                <span className="text-sm font-medium">
                  {isSuppressionEnabled ? 'Suppression: ON' : 'Suppression: OFF'}
                </span>
              </Button>
            </div>
          </div>
          
          {/* Suppression Controls */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Noise Suppression Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Noise Suppression</label>
                  <p className="text-xs text-gray-500">
                    {isSuppressionEnabled 
                      ? 'Active - Background noise is being reduced' 
                      : 'Inactive - Original audio is being used'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSuppressionEnabled}
                    onChange={(e) => setIsSuppressionEnabled(e.target.checked)}
                    className="sr-only peer"
                    disabled={isRecording}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Suppression Level</label>
                    <p className="text-xs text-gray-500">Adjust the intensity of noise reduction</p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {Math.round(suppressionLevel * 100)}%
                  </span>
                </div>
                <Slider
                  value={[suppressionLevel * 100]}
                  onValueChange={(value) => setSuppressionLevel(value[0] / 100)}
                  min={0}
                  max={100}
                  step={5}
                  disabled={!isSuppressionEnabled || isRecording}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 px-1">
                  <span>Less</span>
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Audio Monitor</h3>
              <span className="text-xs text-gray-500">
                {isRecording ? 'Live monitoring active' : 'Start recording to monitor'}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <audio
                ref={audioElementRef}
                className="w-full"
                controls
                controlsList="nodownload"
                muted={!isRecording}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            How to use this demo
          </h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Click <strong>Start Recording</strong> to begin capturing audio</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Toggle the <strong>Suppression</strong> button to hear the difference</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Adjust the <strong>Suppression Level</strong> slider to control noise reduction</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Use the audio monitor to hear the processed audio in real-time</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>Click <strong>Download</strong> to save your recording</span>
            </li>
          </ul>
        </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
        <p className="text-xs text-center text-gray-500">
          Using @shiguredo/noise-suppression • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
