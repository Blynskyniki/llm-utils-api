import { SwaggerOptions } from '@fastify/swagger';

const { SWAGGER_HOST } = process.env;

export const swaggerOptions: SwaggerOptions = {
  openapi: {
    info: {
      title: 'API платформы',
      description: 'Описание всех рутов платформы. Тестовый логин и пароль user@example.com Qwerty123%&@aaaa',
      version: '0.1.0',
    },
    externalDocs: {
      url: 'https://github.com/lad-tech/backend-example',
      description: 'Архитектура платформы',
    },
    servers: [
      {
        url: SWAGGER_HOST || 'http://localhost:3000',
        description: '',
      },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
        },
      },
    },
    security: [{ basicAuth: [] }],
    tags: [],
  },
};
