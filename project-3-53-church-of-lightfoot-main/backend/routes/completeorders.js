import express from "express";
const CompletedOrdersRouter = express.Router();

import client from "../Database.js";

CompletedOrdersRouter.get("/", async (req, res) => {
  try {
    const results = await client.query(
      `SELECT 
  completedorders.order_id,
  completedorders.completed_at,
  completedorders.menu_item_id,
  completedorders.quantity,
  completedorders.itemgroup,
  menu_items.name AS item_name
FROM completedorders
LEFT JOIN menu_items ON completedorders.menu_item_id = menu_items.menu_item_id
WHERE (completedorders.completed_at AT TIME ZONE 'America/Chicago')::date = CURRENT_DATE
ORDER BY completedorders.completed_at DESC;
`
    );

    // order id grouping
    const groupedResults = results.rows.reduce((acc, row) => {
      const {
        order_id,
        completed_at,
        menu_item_id,
        quantity,
        itemgroup,
        item_name,
      } = row;

      if (!acc[order_id]) {
        acc[order_id] = { order_id, completed_at, items: [] };
      }

      acc[order_id].items.push({
        menu_item_id,
        quantity,
        itemgroup,
        name: item_name || "Unknown Item",
      });

      return acc;
    }, {});

    const groupedArray = Object.values(groupedResults);

    res.json(groupedArray);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default CompletedOrdersRouter;
