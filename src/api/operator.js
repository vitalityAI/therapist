import * as dotenv from "dotenv";
import { Router } from "express";
import { authorize } from "../lib/authorize.js";
import { db } from "../lib/db.js";
dotenv.config();

const app = Router();

app.post("/", async (req, res) => {
  const operator = await db.operator.create({
    data: {
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email
    }
  })
  
  return res.status(200).json({
    operator
  })
});

app.post("/update", async (req, res) => {
  const {authorized, webSession} = await authorize(req, res)
  if(!authorized) return res.status(401).send(null)

  const operator = await db.operator.update({
    where: {
      id: webSession.operatorId
    },
    data: {
      phoneNumber: req.body.phone
    }
  })

  return res.status(200).json({
    operator
  })
})

app.post("/login", async (req, res) => {  
  const email = req.body.session.user.email;
  const name = req.body.session.user.name;
  const token = req.body.token.sub;

  let operator = await db.operator.findUnique({
    where: {
      email: email,
    }
  })

  if(!operator){
    operator = await db.operator.create({
      data: {
        name: name,
        email: email
      }
    })
  }
  
  let webSession = await db.webSession.findUnique({
    where: {
      operatorId: operator.id
    }
  });

  if(!webSession){
    webSession = await db.webSession.create({
      data: {
        operatorId: operator.id,
        token: token
      }
    })
  }
  
  return res.status(200).json({
    operator,
    webSession
  })
});

app.get('/', async (req, res) => {
  const email = req.query.email
  const operator = await db.operator.findUnique({
    where: {
      email: email
    }
  })

  return res.status(200).json({operator})
})


export default app