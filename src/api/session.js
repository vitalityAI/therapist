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
  let sessions = await db.session.findMany({
    orderBy: {
      startedAt: 'asc'
    }
  });
  
  if (b == "true") {
    sessions = sessions.filter(session => {
      return !session.transferedAt && !session.endedAt
    })
  }

  return res.status(200).json({
    sessions
  })
})

app.get("/message", async (req, res) => {
  const messages = await getMessagesBySession(req.query.sessionId)
  return res.status(200).json({
    messages
  })
})

app.get("/summary", async (req, res) => {
  const summary = await summarize(req.query.sessionId)
  return res.status(200).json({
    summary
  })
})

app.get('/transfer', async (req, res) => {
  const {authorized, webSession} = await authorize(req, res)
  if(!authorized) return res.status(401).send(null)
  
  const operator = await db.operator.findUnique({
    where: { id: webSession.operatorId}
  })
  const session = await db.session.update({
    where: {
      id: req.query.sessionId
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