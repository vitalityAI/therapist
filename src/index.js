import express from "express";
import call from "./call.js";
import operator from "./operator.js"
import cors from "cors"

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(cors())

app.use('/call', call)
app.use('/operator', operator)

// Create an HTTP server and listen for requests on port 3000
app.listen(8080, () => {
  console.log(
    "Now listening on port 8080. " +
      "Be sure to restart when you make code changes!"
  );
});
