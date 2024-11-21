import { FastifyInstance } from 'fastify';

import { LLMFactory, ProviderType } from '../factories/LLMFactory';
import { SummarizationProvider } from '../interfaces/SummarizationProvider';

export default async function summarizeRoutes(app: FastifyInstance) {
  app.post(
    '/summarize',
    {
      schema: {
        description: 'Суммаризировать текст',
        body: {
          type: 'object',
          required: ['text', 'provider'],
          properties: {
            text: { type: 'string' },
            provider: { type: 'string', enum: Object.values(ProviderType) },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
            },
          },
        },
        security: [{ basicAuth: [] }],
      },
    },
    async (request, reply) => {
      const { text, provider } = request.body as {
        text: string;
        provider: ProviderType;
      };

      let summarizationProvider: SummarizationProvider;
      try {
        summarizationProvider = LLMFactory.createSummarizationProvider(provider);
      } catch (error) {
        reply.status(400).send({ error: error });
        return;
      }

      try {
        const summary = await summarizationProvider.summarize(text);
        reply.send({ summary });
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: error });
      }
    },
  );
}
