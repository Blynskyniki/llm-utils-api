import { FastifyInstance } from 'fastify';

import { LLMFactory, ProviderType } from '../factories/LLMFactory';
import { ChatProvider } from '../interfaces';
import { ChatMessage } from '../models/ChatMessage';

export default async function chatRoutes(app: FastifyInstance) {
  app.post(
    '/chat',
    {
      schema: {
        description: 'Общение с LLM в виде чата',
        body: {
          type: 'object',
          required: ['messages', 'provider'],
          properties: {
            messages: {
              type: 'array',
              items: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                  content: { type: 'string' },
                },
              },
            },
            provider: { type: 'string', enum: Object.values(ProviderType) },
            options: {
              type: 'object',
              properties: {
                stream: { type: 'boolean' },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              response: { type: 'string' },
            },
          },
        },
        security: [{ basicAuth: [] }],
      },
    },
    async (request, reply) => {
      const { messages, provider, options } = request.body as {
        messages: ChatMessage[];
        provider: ProviderType;
        options?: { stream?: boolean };
      };

      let chatProvider: ChatProvider;
      try {
        chatProvider = LLMFactory.createChatProvider(provider);
      } catch (error) {
        reply.status(400).send({ error: error });
        return;
      }

      try {
        const response = await chatProvider.chat(messages, options);
        if (options?.stream && Symbol.asyncIterator in (response as any)) {
          reply.raw.setHeader('Content-Type', 'text/plain; charset=utf-8');
          for await (const chunk of response as AsyncGenerator<string>) {
            reply.raw.write(chunk);
          }
          reply.raw.end();
        } else {
          reply.send({ response });
        }
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error });
      }
    },
  );
}
