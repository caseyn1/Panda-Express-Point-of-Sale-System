import express from "express";
const OrdersRouter = express.Router();

import client from "../Database.js";

OrdersRouter.get("/", async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const results = await client.query(
      "SELECT order_id, total, timestamp, employee_id, reportable FROM orders WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY order_id DESC",
      [startDate, endDate]
    );
    res.json(results.rows);
  } catch (err) {
    console.error(err.message);
  }
});

OrdersRouter.get("/zReport", async (req, res) => {
  try {
    const results = await client.query(
      "SELECT order_id, total, timestamp, employee_id FROM orders WHERE reportable=true ORDER BY order_id DESC"
    );
    res.json(results.rows);
  } catch (err) {
    console.error(err.message);
  }
});

OrdersRouter.get("/menuItemIDs", async (req, res) => {
  const { orders } = req.query;
  try {
    const json = JSON.parse(orders);

    let counter = 1;
    const query = `SELECT menu_item_id FROM menu_orders WHERE order_id IN (${json
      .map(() => `$${counter++}`)
      .join(",")})`;
    const results = await client.query(
      query,
      json.map((order) => order.order_id)
    );
    res.json(results.rows);
  } catch (err) {
    console.error(err.message);
  }
});

OrdersRouter.post("/reset", async (req, res) => {
  await client.query(
    "UPDATE orders SET reportable=false WHERE reportable=true"
  );

  console.log(
    "Set all reportable orders to non-reportable (z-report side effect)"
  );
  res.sendStatus(200);
});

OrdersRouter.get("/favorites", async (req, res) => {
  try {
    const query = `
      SELECT array_agg(menu_item_id ORDER BY count DESC) AS top_menu_items
      FROM (
        SELECT menu_item_id, COUNT(*) AS count
        FROM (
          SELECT * 
          FROM menu_orders
          WHERE menu_order_id > (
            SELECT MAX(menu_order_id) - 100 FROM menu_orders
          )
        ) recent_rows
        WHERE menu_item_id BETWEEN 4 AND 22
        GROUP BY menu_item_id
        ORDER BY count DESC
        LIMIT 5
      ) top_ids;
    `;
    
    const results = await client.query(query);
    res.json(results.rows);

  } catch (error) {
    console.error("Error fetching favorite menu items:", error.message);
    res.sendStatus(500);
  }
});

export default OrdersRouter;
