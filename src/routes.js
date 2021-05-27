import { Router } from "express";
import multer from "multer";
import multerConfig from "./config/multer";
const routes = new Router();

const upload = multer(multerConfig);

import customers from "./app/controllers/CustomersController";
import contacts from "./app/controllers/ContactsController";
import user from "./app/controllers/UsersController";

import auth from "./app/middewares/auth";

import files from "./app/controllers/FilesController";

import session from "./app/controllers/SessionsController";

// Sessions
routes.post("/sessions", session.create);

routes.post("/users", user.create);

routes.use(auth);

// Customers
routes.get("/customers", customers.index);
routes.get("/customers/:id", customers.show);
routes.post("/customers", customers.create);
routes.put("/customers/:id", customers.update);
routes.delete("/customers/:id", customers.destroy);

//Contacts
routes.get("/customers/:customerId/contacts", contacts.index);
routes.get("/customers/:customerId/contacts/:id", contacts.show);
routes.post("/customers/:customerId/contacts", contacts.create);
routes.put("/customers/:customerId/contacts/:id", contacts.update);
routes.delete("/customers/:customerId/contacts/:id", contacts.destroy);

//Users
routes.get("/users", user.index);
routes.get("/users/:id", user.show);
routes.put("/users/:id", user.update);
routes.delete("/users/:id", user.destroy);

// Files
routes.post("/files", upload.single("file"), files.create);

export default routes;
