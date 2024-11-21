import { FastifyInstance } from 'fastify';

import { LLMFactory, ProviderType } from '../factories/LLMFactory';
import { TranscriptionProvider } from '../interfaces/TranscriptionProvider';

export default async function transcribeRoutes(app: FastifyInstance) {
  app.post(
    '/transcribe',
    {
      schema: {
        description: 'Транскрибировать аудио',
        body: {
          type: 'object',
          required: ['audio', 'provider'],
          properties: {
            audio: { type: 'string', format: 'binary' },
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
              transcription: { type: 'string' },
            },
          },
        },
        security: [{ basicAuth: [] }],
      },
    },
    async (request, reply) => {
      const { audio, provider, options } = request.body as {
        audio: Buffer;
        provider: ProviderType;
        options?: { stream?: boolean };
      };

      let transcriptionProvider: TranscriptionProvider;
      try {
        transcriptionProvider = LLMFactory.createTranscriptionProvider(provider);
      } catch (error) {
        reply.status(400).send({ error: error });
        return;
      }

      try {
        const transcription = await transcriptionProvider.transcribe(audio, options);
        reply.send({ transcription });
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: error });
      }
    },
  );
}
