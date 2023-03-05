import * as dotenv from "dotenv";
dotenv.config();

import { Router, json } from "express";
import log from "loglevel";

import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phone_number = process.env.TWILIO_PHONE_NUMBER;
const VoiceResponse = twilio.twiml.VoiceResponse;

import { Role } from "@prisma/client";

import {
  addMessage,
  createSession,
  findSessionByCallId,
  transferSession,
  checkOperatorReady,
  postSummary,
} from "./session.js";
import { chat, summarize } from "./chat.js";

const app = Router();
app.use(json());

app.post("/receive", async (req, res) => {
  let callId = req.body.CallSid;
  log.info(`CallSid: ${callId}`);
  const twiml = new VoiceResponse();

  await createSession(req.body.CallSid, req.body.From);

  const gather = twiml.gather({
    action: "/call/respond",
    method: "POST",
    input: "speech",
    language: "en-US",
    speechTimeout: "auto",
    model: "experimental_conversations",
  });

  gather.say("Welcome to the suicide hotline. Tell me what's going on?.");

  log.info(twiml.toString());

  twiml.redirect("/call/receive");

  res.type("text/xml");
  res.send(twiml.toString());
});

app.post("/respond", async (req, res) => {
  let callId = req.body.CallSid;
  log.info(`CallSid: ${callId}`);
  const twiml = new VoiceResponse();

  let transcription = req.body.SpeechResult;
  await addMessage(callId, Role.USER, transcription);

  let operatorReady = await checkOperatorReady(callId);

  if (operatorReady) {
    let session = await findSessionByCallId(callId);
    let operatorPhone = session.operatorPhone;
    log.info(`transferring call ${callId} to ${operatorPhone}`);

    transferSession(req.body.CallSid, operatorPhone);
    twiml.say("We're connecting you to a counselor now.");

    await addMessage(callId, Role.BOT, "");
    let summary = await summarize(callId);
    log.info(summary);

    const dial = twiml.dial({});
    dial.number(operatorPhone);
    res.type("text/xml");
    res.send(twiml.toString());
    return;
  }

  const gather = twiml.gather({
    action: "/call/respond",
    method: "POST",
    input: "speech",
    language: "en-US",
    speechTimeout: "auto",
    model: "experimental_conversations",
  });

  let response = await chat(callId);

  gather.say(response);
  await addMessage(callId, Role.BOT, response);

  twiml.redirect("/call/respond");

  res.type("text/xml");
  res.send(twiml.toString());
});

app.post("/summarize", async (req, res) => {
  let sessionId = req.body.SessionId;
  log.info(`summarizing ${sessionId}`);

  let summary = await summarize(sessionId);
  log.info(summary);

  await postSummary(sessionId, summary);

  res.type("application/json");
  res.send(JSON.stringify({ SessionId: sessionId, summary: summary }));
});

export default app;
