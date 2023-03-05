import * as dotenv from "dotenv";
import { Router } from "express";
import { authorize } from "../lib/authorize.js";
import { summarize } from "../lib/chat.js";
import { db } from "../lib/db.js";
import { getMessages, getMessagesBySession } from "../lib/session.js";
dotenv.config();

const app = Router();

app.get('/', async (req, res) => {
  const b = req.query.open
  let sessions = [];
  if (b == "true") {
    sessions = await db.session.findMany({
      where: {
        operator: undefined
      }
    })
  } else if(b == "false") {
    sessions = await db.session.findMany({
      where: {
        none: {
          operator: undefined
        }
      }
    })
  } else {
    sessions = await db.session.findMany()
  }

  return res.status(200).json({
    sessions
  })
})

app.get("/message", async (req, res) => {
  const messages = await getMessagesBySession(req.body.sessionId)
  return res.status(200).json({
    messages
  })
})

app.get("/summary", async (req, res) => {
  const summary = await summarize(req.body.sessionId)
  return res.status(200).json({
    summary
  })
})

app.get('/transfer', async (req, res) => {
  const {authorized, webSession} = authorize(req, res)
  if(!authorized) return res.status(401).send(null)
  
  const operator = await db.operator.findUnique({
    where: { id: webSession.operatorId}
  })
  const session = await db.session.update({
    where: {
      id: req.body.sessionId
    },
    data: {
      operatorPhone: operator.phoneNumber
    }
  })

  return res.status(200).json({
    session,
    operator
  })
})

export default app