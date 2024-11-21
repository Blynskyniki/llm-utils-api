// src/providers/OpenAIProvider.ts

import fs from 'fs';
import os from 'os';
import path from 'path';

import { OpenAI, toFile } from 'openai';

import {
  ChatProvider,
  EmbeddingsProvider,
  ImageGenerationProvider,
  SummarizationProvider,
  TranscriptionProvider,
} from '../interfaces';
import { ChatMessage } from '../models/ChatMessage';

export class OpenAIProvider
  implements EmbeddingsProvider, TranscriptionProvider, SummarizationProvider, ChatProvider, ImageGenerationProvider
{
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || '';
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async getTextEmbeddings(input: string): Promise<number[]> {
    // Получение текстовых эмбеддингов через OpenAI API
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input,
    });

    return response.data[0].embedding;
  }

  async transcribe(audio: Buffer, options?: { stream?: boolean }): Promise<string> {
    // Сохранение аудио во временный файл
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.wav`);
    fs.writeFileSync(tempFilePath, audio);

    try {
      const response = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: await toFile(fs.createReadStream(tempFilePath), 'audio.wav'),
      });

      return response.text;
    } finally {
      // Удаляем временный файл
      fs.unlinkSync(tempFilePath);
    }
  }

  async summarize(text: string): Promise<string> {
    // Суммаризация через OpenAI API
    const prompt = `Summarize the following text:\n\n${text}`;

    const response = await this.openai.completions.create({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 150,
    });

    return response.choices[0].text.trim();
  }

  async chat(messages: ChatMessage[], options?: { stream?: boolean }): Promise<string | AsyncGenerator<string>> {
    // Преобразование сообщений в формат, ожидаемый OpenAI API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    if (options?.stream) {
      // Если стриминг включен
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        stream: true, // Указываем, что используем стриминг
      });

      // Возвращаем генератор
      return this.streamChatCompletion(response as unknown as ReadableStream);
    } else {
      // Если стриминг выключен
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        stream: false, // Указываем, что стриминг не используется
      });

      return response.choices[0].message?.content?.trim() || '';
    }
  }

  async generateImage(prompt: string): Promise<Buffer> {
    // Генерация изображений через OpenAI API
    const response = await this.openai.images.generate({
      prompt,
      n: 1,
      size: '512x512',
      response_format: 'b64_json',
    });

    const imageData = response.data[0].b64_json || '';
    return Buffer.from(imageData, 'base64');
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private async *streamChatCompletion(stream: ReadableStream): AsyncGenerator<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunkString = decoder.decode(value);
      const lines = chunkString.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          return;
        } else {
          try {
            const parsed = JSON.parse(message);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (error) {
            console.error('Error parsing stream message', message, error);
          }
        }
      }
    }
  }
}
