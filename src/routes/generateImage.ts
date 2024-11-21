import { FastifyInstance } from 'fastify';

import { LLMFactory, ProviderType } from '../factories/LLMFactory';
import { ImageGenerationProvider } from '../interfaces/ImageGenerationProvider';

export default async function generateImageRoutes(app: FastifyInstance) {
  app.post(
    '/generate-image',
    {
      schema: {
        description: 'Генерация изображения по текстовому описанию',
        body: {
          type: 'object',
          required: ['prompt', 'provider'],
          properties: {
            prompt: { type: 'string' },
            provider: { type: 'string', enum: Object.values(ProviderType) },
          },
        },
        response: {
          200: {
            type: 'string',
            format: 'binary',
          },
        },
        security: [{ basicAuth: [] }],
      },
    },
    async (request, reply) => {
      const { prompt, provider } = request.body as {
        prompt: string;
        provider: ProviderType;
      };

      let imageGenerationProvider: ImageGenerationProvider;
      try {
        imageGenerationProvider = LLMFactory.createImageGenerationProvider(provider);
      } catch (error) {
        reply.status(400).send({ error: error });
        return;
      }

      try {
        const imageBuffer = await imageGenerationProvider.generateImage(prompt);
        reply.type('image/png').send(imageBuffer);
      } catch (error) {
        console.error(error);

        reply.status(500).send({ error: error });
      }
    },
  );
}
