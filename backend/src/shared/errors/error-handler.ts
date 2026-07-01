import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

import { AppError } from "./app-error.js";

export function globalErrorHandler(
  error: FastifyError | Error,
  _request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: true,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details ?? null
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: true,
      message: "Dados invalidos enviados para a requisicao.",
      statusCode: 400,
      details: error.flatten()
    });
  }

  if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
    return reply.status(409).send({
      error: true,
      message: "Ja existe um registro com dados unicos informados.",
      statusCode: 409,
      details: error.meta ?? null
    });
  }

  console.error(error);

  return reply.status(500).send({
    error: true,
    message: "Erro interno do servidor.",
    statusCode: 500,
    details: null
  });
}
