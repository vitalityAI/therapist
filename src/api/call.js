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
  completeCall,
} from "../lib/session.js";
import { chat, summarize } from "../lib/chat.js";

const app = Router();
app.use(json());

app.post("/receive", async (req, res) => {
  let callId = req.body.CallSid;
  console.log(`CallSid: ${callId}`);
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

  gather.say(
    { voice: "Polly.Salli" },
    "Welcome to the Suicide Prevention Hotline. You have reached a virtual resource where you can talk through your problems in a safe and supportive environment. Please know that you are not alone, and help is available. How are you feeling right now?"
  );

  console.log(twiml.toString());

  twiml.redirect("/call/receive");

  res.type("text/xml");
  res.send(twiml.toString());
});

app.post("/respond", async (req, res) => {
  let callId = req.body.CallSid;
  console.log(`CallSid: ${callId}`);
  const twiml = new VoiceResponse();

  let transcription = req.body.SpeechResult;
  await addMessage(callId, Role.USER, transcription);

  let operatorReady = await checkOperatorReady(callId);

  if (operatorReady) {
    let session = await findSessionByCallId(callId);
    let operatorPhone = session.operatorPhone;
    console.log(`transferring call ${callId} to ${operatorPhone}`);

    transferSession(req.body.CallSid, operatorPhone);
    twiml.say(
      { voice: "Polly.Salli" },
      "We're connecting you to a counselor now."
    );

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

  gather.say({ voice: "Polly.Salli" }, response);
  await addMessage(callId, Role.BOT, response);

  twiml.redirect("/call/respond");

  res.type("text/xml");
  res.send(twiml.toString());
});

app.post("/summarize", async (req, res) => {
  let sessionId = req.body.SessionId;
  console.log(`summarizing ${sessionId}`);

  let summary = await summarize(sessionId);
  console.log(summary);

  await postSummary(sessionId, summary);

  res.type("application/json");
  res.send(JSON.stringify({ SessionId: sessionId, summary: summary }));
});

app.post("/status", async (req, res) => {
  let callId = req.body.CallSid;
  let callStatus = req.body.CallStatus;

  if (callStatus === "completed") {
    console.log(`completing call ${callId}`);
    await completeCall(callId);
  }
});

export default app;
