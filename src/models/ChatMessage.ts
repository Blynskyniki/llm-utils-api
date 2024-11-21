// src/models/ChatMessage.ts

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
