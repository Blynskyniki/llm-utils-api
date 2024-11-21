// src/interfaces/TranscriptionProvider.ts

export interface TranscriptionProvider {
  transcribe(audio: Buffer, options?: { stream?: boolean }): Promise<string | AsyncGenerator<string>>;
}
