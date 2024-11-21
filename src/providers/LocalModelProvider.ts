// src/providers/LocalModelProvider.ts

import fs from 'fs/promises';
import { join } from 'path';

import { pipeline } from '@xenova/transformers';
import { AllTasks } from '@xenova/transformers/types/pipelines';

import { ChatProvider, EmbeddingsProvider, SummarizationProvider, TranscriptionProvider } from '../interfaces';
import { ChatMessage } from '../models/ChatMessage';

export class LocalModelProvider
  implements EmbeddingsProvider, TranscriptionProvider, SummarizationProvider, ChatProvider
{
  private embeddingsPipeline: AllTasks['feature-extraction'] | undefined;
  private summarizationPipeline: any;
  private chatPipeline: any;
  private transcriptionPipeline: any;
  private imageGenerationPipeline: any;

  constructor() {}

  async getTextEmbeddings(input: string): Promise<number[]> {
    if (!this.embeddingsPipeline) {
      this.embeddingsPipeline = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2');
    }

    const embeddings = await this.embeddingsPipeline(input, {
      pooling: 'mean', // Среднее по всем токенам
      normalize: true, // Нормализация
    });

    // Преобразуем вложенный массив в одномерный
    return [...embeddings.data];
  }

  async summarize(text: string): Promise<string> {
    if (!this.summarizationPipeline) {
      this.summarizationPipeline = await pipeline('summarization', 'facebook/bart-large-cnn');
    }

    const summary = await this.summarizationPipeline(text);

    return summary[0].summary_text;
  }

  async chat(messages: ChatMessage[], options?: { stream?: boolean }): Promise<string> {
    if (!this.chatPipeline) {
      this.chatPipeline = await pipeline('text-generation', 'Qwen/Qwen2.5-Coder-32B-Instruct');
    }

    // Собираем историю сообщений от пользователя
    const conversationHistory = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n');

    const response = await this.chatPipeline(conversationHistory, {
      max_length: 100,
      do_sample: true,
      top_k: 50,
    });

    return response[0].generated_text;
  }

  async transcribe(audio: Buffer, options?: { stream?: boolean }): Promise<string> {
    if (!this.transcriptionPipeline) {
      this.transcriptionPipeline = await pipeline('automatic-speech-recognition', 'openai/whisper-small');
    }

    // Сохраняем аудио во временный файл
    const tempFilePath = join(__dirname, `../../temp/audio-${Date.now()}.wav`);
    await fs.writeFile(tempFilePath, audio);

    try {
      const transcription = await this.transcriptionPipeline(tempFilePath);
      return transcription.text;
    } finally {
      // Удаляем временный файл
      await fs.unlink(tempFilePath);
    }
  }
}
