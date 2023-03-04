import { Configuration, OpenAIApi } from "openai";
import * as dotenv from 'dotenv'
dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

class Conversation {
  messages;

  constructor(context = "ChatGPT, for the following conversation, please pretend to be a therapist working at a suicide. Respond as if I've called you.") {
    this.messages = [
      {
        "role": "system",
        "content": context
      }
    ]
  }

  async message(msg) {
    this.messages.push({
      "role": "user",
      "content": msg
    })

    const res = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: this.messages
    })
    const next = res.data.choices[0].message
    this.messages.push(next)

    return next.content
  }
}

export {
  Conversation
}