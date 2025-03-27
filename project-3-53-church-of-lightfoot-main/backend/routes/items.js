import express from "express";
const ItemsRouter = express.Router();

import client from "../Database.js";
import { getAllItemsSQL } from "../items_database_commands.js";

/**
 * @route GET /
 * @group Items - Operations about items
 * @returns {Array} 200 - An array of items
 * @returns {Error}  default - Unexpected error
 */
ItemsRouter.get("/", async (req, res) => {
  try {
    const results = await client.query(getAllItemsSQL);
    res.json(results.rows);
  } catch (err) {
    console.error(err.message);
  }
});

/**
 * @route GET /
 * @group Items - Operations about items
 * @returns {Array} 200 - An array of items
 * @returns {Error}  default - Unexpected error
 */
ItemsRouter.get("/onlyfood", async (req, res) => {
  try {
    const results = await client.query(`SELECT name FROM menu_items WHERE menu_item_id>=4 AND menu_item_id<=26`);
    res.json(results.rows);
  } catch (err) {
    console.error(err.message);
  }
});

/**
 * @route GET /{name}
 * @group Items - Operations about items
 * @param {string} name.path.required - name of the item
 * @returns {Array} 200 - An array of items matching the name
 * @returns {Error}  default - Unexpected error
 */
ItemsRouter.get("/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const results = await client.query(`SELECT * FROM menu_items WHERE name = $1`, [name]);
    res.json(results.rows);
  } catch (err) {
    console.error(err.message);
  }
});

/**
 * @route POST /
 * @group Items - Operations about items
 * @param {object} order.body.required - Order object
 * @param {number} order.body.total.required - Total amount of the order
 * @param {number} order.body.employee_id.required - ID of the employee
 * @param {object} order.body.order.required - Items in the order
 * @returns {Status} 200 - Order processed successfully
 * @returns {Error}  default - Unexpected error
 */
ItemsRouter.post("/", async (req, res) => {
  const { total, employee_id, order } = req.body;
  var timestamp = new Date();

  let latest_order_query = await client.query(`SELECT order_id from orders ORDER BY order_id desc LIMIT 1`);
  let latest_order_item_query = await client.query(`SELECT menu_order_id from menu_orders ORDER BY menu_order_id desc LIMIT 1`);

  const latest_order_id = latest_order_query.rows[0]["order_id"];
  let latest_item_id = latest_order_item_query.rows[0]["menu_order_id"];

  const new_order_id = latest_order_id + 1;
  latest_item_id += 1;

  // insert into order table
  await client.query(`INSERT INTO orders (order_id, employee_id, timestamp, total, review, reportable) VALUES ($1, $2, $3, $4, 0, true)`, [
    new_order_id,
    parseInt(employee_id),
    timestamp,
    parseFloat(total),
  ]);
  Object.keys(order).map(async (key) => {
    let items = order[key];

    items.map(async (item) => {
      try {
        await client.query(`INSERT INTO menu_orders (menu_order_id, order_id, menu_item_id, quantity) VALUES ($1, $2, $3, 1)`, [
          latest_item_id,
          new_order_id,
          parseInt(item["menu_item_id"]),
        ]);

        latest_item_id += 1;

        const menuItemId = parseInt(item["menu_item_id"]);
        const ingredientQuery = await client.query(`SELECT ingredient_id, quantity_used FROM menu_items_inventory WHERE menu_item_id = $1`, [
          menuItemId,
        ]);

        for (const ingredient of ingredientQuery.rows) {
          const { ingredient_id, quantity_used } = ingredient;
          await client.query(`UPDATE inventory SET quantity_stock = quantity_stock - $1 WHERE ingredient_id = $2`, [quantity_used, ingredient_id]);
        }
      } catch (error) {
        console.error(error.message);
      }
    });
  });

  res.sendStatus(200);
});

export default ItemsRouter;
