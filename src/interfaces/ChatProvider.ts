// src/interfaces/ChatProvider.ts

import { ChatMessage } from '../models/ChatMessage';

export interface ChatProvider {
  chat(messages: ChatMessage[], options?: { stream?: boolean }): Promise<string | AsyncGenerator<string>>;
}
