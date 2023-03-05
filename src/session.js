import { db } from "./db";

const session = () => {
  db.session.create({})
}
