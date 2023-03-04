import * as dotenv from "dotenv";
dotenv.config();

import twilio from "twilio";
import express from "express";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phone_number = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio.Twilio(accountSid, authToken);
const app = express();

app.post("/voice", (request, response) => {
  console.log("got call!");
  const voiceResponse = new twilio.twiml.VoiceResponse();
  voiceResponse.say({ voice: "alice" }, "hello world!");

  // Render the response as XML in reply to the webhook request
  response.type("text/xml");
  response.send(twiml.toString());
});

// Create an HTTP server and listen for requests on port 3000
app.listen(3000, () => {
  console.log(
    "Now listening on port 3000. " +
      "Be sure to restart when you make code changes!"
  );
});
