import { Conversation } from "./chat.js"

const main = async () => {
  let convo = new Conversation()
  let res = await convo.message("I'm just feeling sad.")
  console.log("RESPONSE", res)
  res = await convo.message("Yeah. My parents got divorced last week, and I think it's my fault.")
  console.log("RESPONSE", res)
}

main()
