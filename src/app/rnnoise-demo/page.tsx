'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Download, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Worklet name that matches our registered processor
const WORKLET_NAME = 'rnnoise-worklet';
const WORKLET_URL = '/worklets/rnnoise-worklet.js';

export default function RnnoiseDemo() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const noiseSuppressorNodeRef = useRef<AudioWorkletNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRecording();
  }, []);

  const updateVolumeMeter = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    const average = sum / dataArray.length;

    // Smooth volume for better UI
    setVolume(prev => prev * 0.8 + (average / 255) * 0.2);

    animationFrameRef.current = requestAnimationFrame(updateVolumeMeter);
  };

  const startRecording = async () => {
    try {
      setIsProcessing(true);
      setError(null);

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 48000
        }
      });
      mediaStreamRef.current = stream;

      // Load our custom worklet
      try {
        await audioContext.audioWorklet.addModule(WORKLET_URL);
        console.log('Worklet loaded successfully');
      } catch (error) {
        console.error('Failed to load worklet:', error);
        throw new Error(`Failed to load audio worklet: error.message}`);
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Create worklet node
      const noiseSuppressorNode = new AudioWorkletNode(audioContext, WORKLET_NAME);
      noiseSuppressorNodeRef.current = noiseSuppressorNode;

      // Handle messages from worklet
      noiseSuppressorNode.port.onmessage = (event) => {
        if (event.data.type === 'error') {
          console.error('Worklet error:', event.data.error);
          setError(`Audio processing error: ${event.data.error}`);
        } else if (event.data.type === 'initialized') {
          console.log('RNNoise worklet initialized');
        }
      };

      // Initialize the worklet with any required parameters
      noiseSuppressorNode.port.postMessage({ type: 'init' });



      // Connect nodes
      source.connect(noiseSuppressorNode);
      noiseSuppressorNode.connect(analyser);
      analyser.connect(audioContext.destination);

      // Audio monitoring
      if (audioElementRef.current) {
        const dest = audioContext.createMediaStreamDestination();
        analyser.connect(dest);
        audioElementRef.current.srcObject = dest.stream;
        audioElementRef.current.play().catch(() => {});
      }

      updateVolumeMeter();

      // Setup MediaRecorder
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setRecordedAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();

    noiseSuppressorNodeRef.current?.disconnect();
    analyserRef.current?.disconnect();

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    setIsRecording(false);
    setVolume(0);
  };

  const toggleRecording = () => {
    isRecording ? stopRecording() : startRecording();
  };

  const downloadRecording = () => {
    if (!recordedAudioUrl) return;

    const a = document.createElement('a');
    a.href = recordedAudioUrl;
    a.download = `recording-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">RNNoise Noise Suppression Demo</h1>
          <p className="text-gray-600 mb-6">Real-time noise suppression using @timephy/rnnoise-wasm</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
          )}

          <div className="space-y-6">
            {/* Status Bar */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isRecording ? 'Recording with RNNoise' : 'Ready to record'}
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

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`flex-1 w-full sm:w-auto flex items-center justify-center space-x-2 py-3 text-base ${
                  isRecording ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100' : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-100'
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
                    <span>Start Recording</span>
                  </>
                )}
              </Button>

              <Button
                onClick={downloadRecording}
                disabled={!recordedAudioUrl}
                variant="outline"
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-3"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </Button>
            </div>

            {/* Audio monitor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Audio Monitor</h3>
                <span className="text-xs text-gray-500">
                  {isRecording ? 'Live monitoring active' : 'Start recording to monitor'}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <audio ref={audioElementRef} className="w-full" controls controlsList="nodownload" muted={!isRecording} />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            Using @timephy/rnnoise-wasm • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
