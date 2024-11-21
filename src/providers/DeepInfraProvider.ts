// src/providers/DeepInfraProvider.ts

import { OpenAI } from 'openai';

import { ChatProvider, EmbeddingsProvider, SummarizationProvider } from '../interfaces';
import { ChatMessage } from '../models/ChatMessage';

interface DeepInfraConfig {
  model: string;
}

export class DeepInfraProvider implements EmbeddingsProvider, SummarizationProvider, ChatProvider {
  private openai: OpenAI;
  private model: string;

  constructor(config: DeepInfraConfig) {
    const { model } = config;

    const apiKey = process.env.DEEPINFRA_API_KEY;

    if (!apiKey) {
      throw new Error('DEEPINFRA_API_KEY is not set in environment variables.');
    }

    if (!model) {
      throw new Error('Model is not set for DeepInfraProvider.');
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepinfra.com/v1/openai',
    });

    this.model = model;
  }

  async getTextEmbeddings(input: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.model,
      input,
    });

    return response.data[0].embedding;
  }

  async summarize(text: string): Promise<string> {
    const prompt = `Summarize the following text:\n\n${text}`;

    const response = await this.openai.completions.create({
      model: this.model,
      prompt,
      max_tokens: 150,
    });

    return response.choices[0].text.trim();
  }

  async chat(messages: ChatMessage[], options?: { stream?: boolean }): Promise<string | AsyncGenerator<string>> {
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    if (options?.stream) {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: formattedMessages,
        stream: true,
      });

      return this.streamChatCompletion(response as unknown as ReadableStream);
    } else {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: formattedMessages,
      });

      return response.choices[0].message?.content?.trim() || '';
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private async *streamChatCompletion(response: any): AsyncGenerator<string> {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunkString = decoder.decode(value);
      const lines = chunkString.split('\n').filter((line: string) => line.trim() !== '');

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
