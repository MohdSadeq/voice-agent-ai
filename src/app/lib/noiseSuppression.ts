import { NoiseSuppressorWorklet_Name } from "@timephy/rnnoise-wasm"

/**
 * Applies noise suppression to a MediaStream.
 * @param stream The input MediaStream.
 * @returns A new MediaStream with noise suppression applied, or the original stream if it fails.
 */
export async function applyNoiseSuppression(stream: MediaStream): Promise<MediaStream> {
    try {
        const ctx = new AudioContext()

        // Load the NoiseSuppressorWorklet into the AudioContext
        // We use the static path from the public directory as it's pre-configured for Next.js
        await ctx.audioWorklet.addModule('/rnnoise/NoiseSuppressorWorklet.js')

        // Instantiate the Worklet as a Node
        const noiseSuppressionNode = new AudioWorkletNode(ctx, NoiseSuppressorWorklet_Name)

        // Setup the node graph
        const source = ctx.createMediaStreamSource(stream)
        const destination = ctx.createMediaStreamDestination()

        source
            .connect(noiseSuppressionNode) // pass audio through noise suppression
            .connect(destination) // output to destination stream

        return destination.stream
    } catch (error) {
        console.error('Error applying noise suppression:', error)
        return stream // Fallback to original stream
    }
}
