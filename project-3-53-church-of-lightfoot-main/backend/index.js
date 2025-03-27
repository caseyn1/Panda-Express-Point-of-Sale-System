// create an express api
import express from "express";
const app = express();
import cors from 'cors';
import bodyParser from 'body-parser';

import ItemsRouter from './routes/items.js';
import EmployeesRouter from './routes/employees.js';
import InventoryRouter from './routes/inventory.js';
import OrdersRouter from './routes/orders.js';
import KioskRouter from './routes/kiosk.js';
import KioskOrdersRouter from './routes/kioskorders.js';
import ItemUsageRouter from './routes/itemusage.js';
import CustomersRouter from "./routes/customers.js";
import SeasonalsRouter from './routes/seasonal.js';
import CompletedOrdersRouter from './routes/completeorders.js';
import UserRouter from './routes/user.js';
import ReviewsRouter from "./routes/review.js";
import SalesReportRouter from "./routes/salesreport.js";

// Database client
app.use(cors());
app.use(bodyParser.json());

// create express get request
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/items", ItemsRouter);

app.use("/employees", EmployeesRouter);

app.use("/inventory", InventoryRouter);

app.use("/orders", OrdersRouter);

app.use("/kioskorders", KioskOrdersRouter);

app.use("/kiosk", KioskRouter);

app.use("/itemusage", ItemUsageRouter);

app.use("/users", UserRouter);

app.use('/completedorders', CompletedOrdersRouter);

app.use("/seasonal", SeasonalsRouter);

app.use("/customers", CustomersRouter);

app.use("/reviews", ReviewsRouter);

app.use("/salesreport", SalesReportRouter);

// run the express server
app.listen(8000, () => {
  console.log("server started");
});

