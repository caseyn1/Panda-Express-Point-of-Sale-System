import express from 'express';
const InventoryRouter = express.Router();

import client from '../Database.js';

/**
 * GET /
 *
 * @description Fetches all inventory data from the database, including details like 
 *              ingredient ID, name, stock quantity, unit, thresholds, restock quantity, and price.
 * 
 * @returns {Object[]} JSON array of inventory items.
 */
InventoryRouter.get('/', async (req, res) => {
  try {
    const results = await client.query(`
      SELECT ingredient_id, name, quantity_stock, unit, min_threshold, max_threshold, restock_quantity, current_price
      FROM inventory
      ORDER BY ingredient_id ASC
    `);
    res.json(results.rows);
  } catch (err) {
    console.error("Error fetching inventory data:", err.message);
    res.status(500).send('Error fetching inventory data');
  }
});

InventoryRouter.get('/orders', async (req, res) => {
  try {
    const results = await client.query(`
      SELECT * FROM menu_items_inventory
      ORDER BY menu_item_id ASC
    `);
    res.json(results.rows);
  } catch (err) {
    console.error("Error fetching menu item inventory data:", err.message);
    res.status(500).send('Error fetching menu item inventory data');
  }
});

InventoryRouter.get('/name', async (req, res) => {
  const { ingredient } = req.query;
  try {
    const results = await client.query(`SELECT name, unit FROM inventory WHERE ingredient_id=${ingredient}`);
    res.json(results.rows);
  } catch (err) {
    console.error("Error fetching inventory names:", err.message);
    res.status(500).send('Error fetching inventory names');
  }
});

InventoryRouter.post('/restock', async (req, res) => {
  try {
    const { rows: itemsToRestock } = await client.query(`
      SELECT ingredient_id, max_threshold, quantity_stock
      FROM inventory
      WHERE quantity_stock < min_threshold
    `);

    if (itemsToRestock.length === 0) {
      return res.status(200).json({ message: "No items need restocking." });
    }

    await client.query('BEGIN');
    for (const item of itemsToRestock) {
      await client.query(
        `UPDATE inventory 
         SET quantity_stock = max_threshold
         WHERE ingredient_id = $1`,
        [item.ingredient_id]
      );
    }
    await client.query('COMMIT');

    res.status(200).json({ message: "Inventory restocked to maximum thresholds successfully." });
  } catch (err) {
    console.error("Error in restocking:", err.message);
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Failed to restock inventory", message: err.message });
  }
});

InventoryRouter.delete("/:ingId", async (req, res) => {
  try {
    const { ingId } = req.params;
    await client.query('DELETE FROM inventory WHERE ingredient_id = $1', [ingId]);
    console.log("Seasonal removal success!");
    res.sendStatus(200);
    return;
  } catch (err) {
    console.error("Error in deleteing ingredient:", err.message);
  }
});


export default InventoryRouter;
