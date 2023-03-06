import express from "express";
import cors from "cors";

import call from "./api/call.js";
import operator from "./api/operator.js";
import session from "./api/session.js";
import status from "./api/status.js";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use("/call", call);
app.use("/operator", operator);
app.use("/session", session);
app.use("/status", status);

// Create an HTTP server and listen for requests on port 3000
app.listen(8080, () => {
  console.log(
    "Now listening on port 8080. " +
      "Be sure to restart when you make code changes!"
  );
});
