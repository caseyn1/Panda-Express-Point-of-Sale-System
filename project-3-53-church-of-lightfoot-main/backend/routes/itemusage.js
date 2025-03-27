import express from "express";
const ItemUsageRouter = express.Router();

import client from "../Database.js";

ItemUsageRouter.get("/", async (req, res) => {
  try {
    const { name, startDate, endDate } = req.query;
    // Taken from Project 2
    let result = await client.query(`
    SELECT DATE(o.timestamp) AS usage_date, SUM(mii.quantity_used) AS total_usage
    FROM orders o
    JOIN menu_orders mo ON o.order_id = mo.order_id
    JOIN menu_items_inventory mii ON mo.menu_item_id = mii.menu_item_id
    JOIN inventory ii ON mii.ingredient_id = ii.ingredient_id
    WHERE ii.name = $1 AND o.timestamp BETWEEN $2 AND $3
    GROUP BY DATE(o.timestamp) 
    ORDER BY usage_date
    `, [name, startDate, endDate]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

export default ItemUsageRouter;
