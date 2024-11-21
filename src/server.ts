// src/server.ts
import fastifyBasicAuth from '@fastify/basic-auth';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import Fastify from 'fastify';

import chatRoutes from './routes/chat';
import embeddingsRoutes from './routes/embeddings';
import generateImageRoutes from './routes/generateImage';
import summarizeRoutes from './routes/summarize';
import transcribeRoutes from './routes/transcribe';
import { swaggerOptions } from './swagger';
import { validate } from './utils/authentication';

async function main() {
  dotenv.config();

  const server = Fastify({
    logger: true,
  });
  await server.register(cors, {
    origin: '*', // В продакшене укажите конкретные источники
  });
  // Регистрация плагина swagger
  await server.register(swagger, swaggerOptions);

  await server.register(swaggerUI, {});

  // Регистрация плагина базовой аутентификации
  await server.register(fastifyBasicAuth, { validate });

  // Маршруты с защитой аутентификацией
  server.register(async secureApp => {
    // secureApp.addHook('onRequest', secureApp.basicAuth);

    secureApp.register(embeddingsRoutes);
    secureApp.register(transcribeRoutes);
    secureApp.register(summarizeRoutes);
    secureApp.register(chatRoutes);
    secureApp.register(generateImageRoutes);
  });

  // Запуск сервера
  const PORT = process.env.PORT || 3000;
  await server.ready();

  console.log(server.swagger());
  server.listen(
    {
      port: +PORT,
      host: process.env.HOST || '0.0.0.0',
    },
    (err, address) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }
      console.log(`Server listening at ${address}`);
      console.log(`Swagger UI available at ${address}/documentation`);
    },
  );
}

main();
