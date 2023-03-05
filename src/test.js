import { chat } from "./chat.js"
import { createSession } from "./session.js"

const main = async () => {
  // const session = await createSession("testid", "12345")
  console.log(await chat("testid"))
}

main()
