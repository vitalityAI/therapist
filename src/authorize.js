import { PrismaClient } from '@prisma/client';
import {db} from './db.js'

export const authorize = async (req, res, admin=false) => {
  let authorization = null
  if(!authorization) authorization = req.headers.authorization
  if(!authorization && req.cookies.auth) {
    const auth = JSON.parse(req.cookies.auth)
    if(auth) authorization = `Bearer ${auth.access_token}`
  }
  req.headers.authorization = authorization
  
  console.log(authorization)
  
  return {
    authorized
  }
}