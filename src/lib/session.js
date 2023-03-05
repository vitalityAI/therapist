import { Role } from "@prisma/client";
import { db } from "./db.js";

export const createSession = async (callId, callerPhone) => {
  let session = await findSessionByCallId(callId);
  if (session) return session;

  return await db.session.create({
    data: {
      callId: callId,
      callerPhone: callerPhone,
    },
  });
};

export const findSessionByCallId = async (callId) => {
  return await db.session.findUnique({
    where: {
      callId: callId,
    },
  });
};

export const transferSession = async (callId, operatorPhone) => {
  return await db.session.update({
    where: {
      callId: callId,
    },
    data: {
      transferedAt: new Date(),
      operatorPhone: operatorPhone,
    },
  });
};

export const postSummary = async (sessionId, summary) => {
  return await db.session.update({
    where: {
      id: sessionId,
    },
    data: {
      summary: summary,
    },
  });
};

export const checkOperatorReady = async (callId) => {
  const session = await findSessionByCallId(callId);
  return session.operatorPhone != null;
};

export const endSession = async (callId) => {
  return await db.session.update({
    where: {
      callId: callId,
    },
    data: {
      endedAt: new Date(),
    },
  });
};

export const addMessage = async (callId, role, content) => {
  const session = await findSessionByCallId(callId);
  return await db.message.create({
    data: {
      sessionId: session.id,
      role: role,
      content: content,
    },
  });
};

export const getMessages = async (callId) => {
  return await db.message.findMany({
    where: {
      session: {
        callId: callId,
      },
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
  });
};

export const getMessagesBySession = async (sessionId) => {
  return await db.message.findMany({
    where: {
      session: {
        id: sessionId,
      },
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
  });
};
