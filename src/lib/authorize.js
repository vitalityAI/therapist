import { PrismaClient } from '@prisma/client';
import {db} from './db.js'

export const authorize = async (req, res) => {
  let authorization = null
  if(!authorization) authorization = req.headers.authorization
  if(!authorization && req.cookies.auth) {
    const auth = JSON.parse(req.cookies.auth)
    if(auth) authorization = `Bearer ${auth.access_token}`
  }
  const token = authorization.replace("Bearer ", "")
  const webSession = await db.webSession.findUnique({
    where: {
      token: token
    },
  })

  const authorized = webSession != null
  
  return {
    authorized,
    webSession
  }
}