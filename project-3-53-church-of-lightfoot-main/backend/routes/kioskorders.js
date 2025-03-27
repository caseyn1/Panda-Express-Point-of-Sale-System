import express from "express";
const KioskOrdersRouter = express.Router();

import client from "../Database.js";

KioskOrdersRouter.get("/", async (req, res) => {
  try {
    const results = await client.query(
      `SELECT 
              currentorders.order_id,
              currentorders.order_created,
              currentorders.menu_item_id,
              currentorders.quantity,
              currentorders.itemgroup,
              menu_items.name AS item_name,
              menu_items.item_type
           FROM currentorders
           LEFT JOIN menu_items ON currentorders.menu_item_id = menu_items.menu_item_id`
    );

    // Group by order_id
    const groupedResults = results.rows.reduce((acc, row) => {
      const {
        order_id,
        order_created,
        menu_item_id,
        quantity,
        itemgroup,
        item_name,
        item_type,
      } = row;

      if (!acc[order_id]) {
        acc[order_id] = { order_id, order_created, items: [] };
      }

      acc[order_id].items.push({
        menu_item_id,
        quantity,
        itemgroup,
        name: item_name || "Unknown Item", // Default if item_name is null
        item_type: item_type || "Unknown Type", // Default if item_type is null
      });

      // Sort items in descending order by itemgroup within each order
      acc[order_id].items.sort((a, b) => b.itemgroup - a.itemgroup);

      return acc;
    }, {});

    // Convert groupedResults object to an array for JSON response
    const groupedArray = Object.values(groupedResults);

    res.json(groupedArray);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

KioskOrdersRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Start a transaction
    await client.query("BEGIN");

    // Retrieve the order to be deleted
    const orderResult = await client.query(
      `SELECT 
              order_id,
              order_created,
              menu_item_id,
              quantity,
              itemgroup
       FROM currentorders
       WHERE order_id = $1`,
      [id]
    );

    const order = orderResult.rows;

    if (order.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    // Insert the retrieved order into the completedorders table
    for (const item of order) {
      await client.query(
        `INSERT INTO completedorders 
           (order_id, order_created, menu_item_id, quantity, itemgroup, completed_at) 
         VALUES ($1, $2, $3, $4, $5, NOW() AT TIME ZONE 'America/Chicago')`,
        [
          item.order_id,
          item.order_created,
          item.menu_item_id,
          item.quantity,
          item.itemgroup,
        ]
      );
    }

    // Delete the order from the currentorders table
    await client.query("DELETE FROM currentorders WHERE order_id = $1", [id]);

    // Commit the transaction
    await client.query("COMMIT");

    console.log("Removed order and saved to completedorders");
    res.sendStatus(200);
  } catch (err) {
    console.error(err.message);
    await client.query("ROLLBACK"); // Rollback the transaction in case of an error
    res.status(500).send("Server error");
  }
});

export default KioskOrdersRouter;
