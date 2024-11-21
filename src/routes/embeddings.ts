import { FastifyInstance } from 'fastify';

import { LLMFactory, ProviderType } from '../factories/LLMFactory';
import { EmbeddingsProvider } from '../interfaces';

export default async function embeddingsRoutes(app: FastifyInstance) {
  app.post(
    '/embeddings/text',
    {
      schema: {
        description: 'Получить текстовые эмбеддинги',
        body: {
          type: 'object',
          required: ['input', 'provider'],
          properties: {
            input: { type: 'string' },
            provider: { type: 'string', enum: Object.values(ProviderType) },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              embeddings: {
                type: 'array',
                items: { type: 'number' },
              },
            },
          },
        },
        security: [{ basicAuth: [] }],
      },
    },
    async (request, reply) => {
      const { input, provider } = request.body as {
        input: string;
        provider: ProviderType;
      };

      let embeddingsProvider: EmbeddingsProvider;
      try {
        embeddingsProvider = LLMFactory.createEmbeddingsProvider(provider);
      } catch (error) {
        reply.status(400).send({ error: error });
        return;
      }

      try {
        const embeddings = await embeddingsProvider.getTextEmbeddings(input);
        reply.send({ embeddings });
      } catch (error) {
        console.error(error);

        reply.status(500).send({ error: error });
      }
    },
  );
}
