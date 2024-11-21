// src/utils/authentication.ts

import { FastifyReply, FastifyRequest } from 'fastify';

export async function validate(
  username: string,
  password: string,
  req: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const USERNAME = process.env.USERNAME || '';
  const PASSWORD = process.env.PASSWORD || '';

  if (username === USERNAME && password === PASSWORD) {
    return;
  }

  throw new Error('Unauthorized');
}
