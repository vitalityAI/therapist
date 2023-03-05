import * as dotenv from "dotenv";
dotenv.config();

import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

import { Role } from "@prisma/client";

import { getMessages, getMessagesBySession } from "./session.js";

const convertRole = (role) => {
  switch (role) {
    case Role.BOT:
      return "assistant";
    case Role.USER:
      return "user";
    default:
      return "user";
  }
};

export const chat = async (callId) => {
  const msgs = await getMessages(callId);
  const messages = [
    {
      role: "system",
      content:
        "ChatGPT, for the following conversation, please pretend to be a therapist working at a suicide prevention hotline. Respond as if I've called you. Limit your responses to 20 seconds, and don't recommend that they seek other help. Make sure you continue the conversation by ending every response with a question.",
    },
  ];

  for (let msg of msgs) {
    messages.push({
      role: convertRole(msg.role),
      content: msg.content,
    });
  }

  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  return res.data.choices[0].message.content;
};

export const summarize = async (sessionId) => {
  const msgs = await getMessagesBySession(sessionId);
  const context = [
    {
      role: "system",
      content:
        "This is a conversation between ChatGPT and someone calling the suicide prevention hotline. Please summarize the main issues that the caller is facing and highlight important points in the conversation. Keep your summary short.",
    },
  ];

  for (let msg of msgs) {
    context.push({
      role: convertRole(msg.role),
      content: msg.content,
    });
  }

  context.push({
    role: convertRole(Role.USER),
    content:
      "This conversation is now being shown to a mental health professional. Please summarize the main issues that the caller is facing and highlight important points in the conversation. Keep your summary short.",
  });

  const res = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: context,
  });

  return res.data.choices[0].message.content;
};
