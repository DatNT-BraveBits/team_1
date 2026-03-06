import prisma from "../../../db.server.js";

export async function saveMessage({ sessionId, nickname, clientId, message }) {
  return prisma.feature5_ChatMessage.create({
    data: { sessionId, nickname, clientId, message },
  });
}

export async function getRecentMessages(sessionId, limit = 50) {
  return prisma.feature5_ChatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: {
      id: true,
      nickname: true,
      clientId: true,
      message: true,
      createdAt: true,
    },
  });
}
