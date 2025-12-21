// Type definitions for @shiguredo/noise-suppression
declare global {
  interface Window {
    NoiseSuppressionProcessor: {
      new (): NoiseSuppressionProcessor;
    };
  }

  interface NoiseSuppressionProcessor {
    startProcessing(track: MediaStreamTrack): Promise<MediaStreamTrack>;
    stopProcessing(): Promise<void>;
  }
}

export {};
