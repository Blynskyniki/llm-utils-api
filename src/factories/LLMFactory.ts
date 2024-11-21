// src/factories/LLMFactory.ts

import {
  ChatProvider,
  EmbeddingsProvider,
  ImageGenerationProvider,
  SummarizationProvider,
  TranscriptionProvider,
} from '../interfaces';
import { DeepInfraProvider } from '../providers/DeepInfraProvider';
import { LocalModelProvider } from '../providers/LocalModelProvider';
import { OpenAIProvider } from '../providers/OpenAIProvider';

export enum ProviderType {
  OpenAI = 'OpenAI',
  Local = 'Local',
  DeepInfra = 'DeepInfra',
}

export class LLMFactory {
  static createEmbeddingsProvider(providerType: ProviderType): EmbeddingsProvider {
    switch (providerType) {
      case ProviderType.OpenAI:
        return new OpenAIProvider();

      case ProviderType.DeepInfra:
        // Указываем модель при создании провайдера
        return new DeepInfraProvider({
          model: 'sentence-transformers/all-MiniLM-L12-v2',
        });

      case ProviderType.Local:
        return new LocalModelProvider();

      default:
        throw new Error(`Provider ${providerType} does not support embeddings`);
    }
  }

  static createChatProvider(providerType: ProviderType): ChatProvider {
    switch (providerType) {
      case ProviderType.OpenAI:
        return new OpenAIProvider();

      case ProviderType.DeepInfra:
        return new DeepInfraProvider({
          model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        });

      case ProviderType.Local:
        return new LocalModelProvider();

      default:
        throw new Error(`Provider ${providerType} does not support chat`);
    }
  }

  static createSummarizationProvider(providerType: ProviderType): SummarizationProvider {
    switch (providerType) {
      case ProviderType.OpenAI:
        return new OpenAIProvider();

      case ProviderType.DeepInfra:
        return new DeepInfraProvider({
          model: 'BAAI/bge-m3',
        });

      default:
        throw new Error(`Provider ${providerType} does not support summarization`);
    }
  }

  static createTranscriptionProvider(providerType: ProviderType): TranscriptionProvider {
    switch (providerType) {
      case ProviderType.OpenAI:
        return new OpenAIProvider();

      case ProviderType.Local:
        return new LocalModelProvider();

      default:
        throw new Error(`Provider ${providerType} does not support transcription`);
    }
  }

  static createImageGenerationProvider(providerType: ProviderType): ImageGenerationProvider {
    // eslint-disable-next-line sonarjs/no-small-switch
    switch (providerType) {
      case ProviderType.OpenAI:
        return new OpenAIProvider();

      default:
        throw new Error(`Provider ${providerType} does not support image generation`);
    }
  }
}
