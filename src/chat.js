import { Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv'
import { getMessages } from "./session";
dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const chat = async (callId) => {
  const msgs = await getMessages(callId)
  const messages = [
    {
      "role": "system",
      "content": "ChatGPT, for the following conversation, please pretend to be a therapist working at a suicide. Respond as if I've called you."
    }
  ]
  
  for(let msg of msgs){
    messages.push({
      "role": msg.role,
      "content": msg.content
    })
  }

  await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages
  })
}
