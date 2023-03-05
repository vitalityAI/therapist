import { Role } from "@prisma/client"
import { chat } from "./chat.js"
import { addMessage, createSession } from "./session.js"

const main = async () => {
  const session = await createSession("testid", "12345")
  await addMessage("testid", Role.USER, "Hey. I'm feeling ")
  console.log(await chat("testid"))
}

main()
