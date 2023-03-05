import * as dotenv from "dotenv";
dotenv.config();

import twilio from "twilio";
import express from "express";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phone_number = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio.Twilio(accountSid, authToken);
const VoiceResponse = twilio.twiml.VoiceResponse;

const app = express();
app.use(express.urlencoded({ extended: false }));

app.post("/receive", (req, res) => {
  // Use the Twilio Node.js SDK to build an XML response
  const twiml = new VoiceResponse();

  // Use <Record> to record and transcribe the caller's message
  const gather = twiml.gather({
    action: "/respond",
    method: "POST",
    input: "speech",
    language: "en-US",
    speechTimeout: "auto",
  });

  gather.say("Tell us what makes you sad.");

  twiml.redirect("/call");

  res.type("text/xml");
  res.send(twiml.toString());
});

app.post("/respond", async (req, res) => {
  const twiml = new VoiceResponse();

  let transcription = req.body.SpeechResult;
  console.log(transcription);

  twiml.say(`You said, ${transcription}`);
  twiml.say(`Don't kill yourself.`);

  const gather = twiml.gather({
    action: "/respond",
    method: "POST",
    input: "speech",
    language: "en-US",
    speechTimeout: "auto",
  });

  gather.say("Tell us what makes you sad.");

  res.type("text/xml");
  res.send(twiml.toString());
});

// Create an HTTP server and listen for requests on port 3000
app.listen(3000, () => {
  console.log(
    "Now listening on port 3000. " +
      "Be sure to restart when you make code changes!"
  );
});
