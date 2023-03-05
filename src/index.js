import express from "express";
import call from "./call.js";

const app = express();
app.use(express.urlencoded({ extended: false }));

app.use('/call', call)

// Create an HTTP server and listen for requests on port 3000
app.listen(3000, () => {
  console.log(
    "Now listening on port 3000. " +
      "Be sure to restart when you make code changes!"
  );
});
