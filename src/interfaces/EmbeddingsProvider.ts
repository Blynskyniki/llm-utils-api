// src/interfaces/EmbeddingsProvider.ts

export interface EmbeddingsProvider {
  getTextEmbeddings(input: string): Promise<number[]>;

  getImageEmbeddings?(image: Buffer): Promise<number[]>;
}
