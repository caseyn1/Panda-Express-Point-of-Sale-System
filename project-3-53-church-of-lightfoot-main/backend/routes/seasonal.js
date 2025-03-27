import express from "express";
const SeasonalsRouter = express.Router();

import client from "../Database.js";
import { isPIN } from "../util/helperFunctions.js";

SeasonalsRouter.get("/", async (req, res) => {
    try {
      const results = await client.query(
        `SELECT * FROM menu_items`
      );
      res.json(results.rows);
    } catch (err) {
      console.error(err.message);
    }
  });

  SeasonalsRouter.post("/add", async (req, res) => {
    console.log("Received request body:", req.body);
    const { name, price, calories, protein, carbohydrate, saturated_fat, spicy, premium, allergens, type, ingredientQuantities, ingredientUnits } = req.body;
    // Validate input
    console.log(typeof spicy, typeof premium, typeof price, typeof name);
    if (
      !name || !name.trim() || // Ensure name is a non-empty string
      isNaN(price) || parseFloat(price) < 0 || // Price must be a positive number
      isNaN(calories) || parseInt(calories) < 0 || // Calories must be > 0
      isNaN(protein) || parseFloat(protein) < 0 || // Protein must be >= 0
      isNaN(carbohydrate) || parseFloat(carbohydrate) < 0 || // Carbohydrate must be >= 0
      isNaN(saturated_fat) || parseFloat(saturated_fat) < 0 // Saturated fat must be >= 0
    ) {
      console.log("Invalid nutritional or price data!");
      res.sendStatus(400);
      return;
    }
    if (
      !(type === "DRINK" || type === "REWARDS" || type === "MEAL") &&
      (
        !ingredientQuantities || // Check if null or undefined
        Object.keys(ingredientQuantities).length === 0 || // Check if empty
        Object.entries(ingredientQuantities).some(([id, quantity]) => 
          isNaN(parseInt(id)) || 
          isNaN(parseFloat(quantity)) || 
          parseFloat(quantity) <= 0 || 
          parseFloat(quantity) > 10.0 // Ensure quantity is > 0 and <= 10.0
        )
      )
    ) {
      console.log("Ingredient quantities are invalid!");
      res.sendStatus(400);
      return;
    }
    

  if (!(type === "DRINK" || type === "REWARDS" || type === "MEAL") && !(calories > 0.0)) {
    console.log("Ingredient quantities are invalid!");
    res.sendStatus(400);
    return;
  }

    try {
        const highIDResult = await client.query("SELECT MAX(menu_item_id) AS max FROM menu_items");
        const highID = highIDResult.rows[0].max || 0;

        if (type === "DRINK" || type === "REWARDS" || type === "MEAL") {
          await client.query(
            "INSERT INTO menu_items (menu_item_id, name, item_type, price) VALUES ($1, $2, $3, $4)",
            [highID + 1, name, type, price]
          );
          console.log("Add success 0!");
          console.log("Added menu item");
          res.sendStatus(200);
          return;       
        } else {
          await client.query(
            "INSERT INTO menu_items (menu_item_id, name, item_type, price) VALUES ($1, $2, $3, $4)",
            [highID + 1, name, type, price]
          );
          await client.query(
            "INSERT INTO menu_items_info (menu_item_id, name) VALUES ($1, $2) RETURNING menu_item_info_id",
            [highID + 1, name]
          );
          console.log("Add success 1!");
          if (allergens.trim().length === 0) {
            await client.query(
              "UPDATE menu_items_info SET calories = $1, protein = $2, carbohydrate = $3, saturated_fat = $4, spicy = $5, premium = $6 WHERE menu_item_id = $7",
              [
                parseInt(calories),
                parseFloat(protein),
                parseFloat(carbohydrate),
                parseFloat(saturated_fat),
                spicy,
                premium,
                highID +1
              ]
            );
          } else {
            await client.query(
              "UPDATE menu_items_info SET calories = $1, protein = $2, carbohydrate = $3, saturated_fat = $4, spicy = $5, premium = $6, allergens = $7 WHERE menu_item_id = $8",
              [
                parseInt(calories),
                parseFloat(protein),
                parseFloat(carbohydrate),
                parseFloat(saturated_fat),
                spicy,
                premium,
                allergens,
                highID +1
              ]
            );
          }
          console.log("Add success 2!");
          //for (let i = 0; i < ingredients.length; ++i) {} add to menu_items_inventory
          for (const [ingredientId, quantity] of Object.entries(ingredientQuantities)) {
            const parsedId = parseInt(ingredientId);
            const parsedQuantity = parseFloat(quantity);
            const ingredientUnit = ingredientUnits[ingredientId] || "Unknown";
          
            await client.query(
              "INSERT INTO menu_items_inventory (menu_item_id, ingredient_id, quantity_used, unit) VALUES ($1, $2, $3, $4)",
              [highID + 1, parsedId, parsedQuantity, ingredientUnit]
            );
            console.log(`Added ingredient with ID ${parsedId} and quantity ${parsedQuantity}`);
          }
          
          console.log("Ingredients added to menu_items_inventory successfully.");
          console.log("Added menu item");
          res.sendStatus(200);
          return;
        }
    } catch (err) {
      console.log("JK lil bro 1"); 
      console.error("Error in /add route:", err.message);
      res.sendStatus(500);
      return;
    }
});

SeasonalsRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Removing seasonal #", id, "...");
  
    await client.query("DELETE FROM menu_items_info WHERE menu_item_id = $1", [id]);
    await client.query("DELETE FROM menu_items WHERE menu_item_id = $1", [id]);
    await client.query("DELETE FROM menu_items_inventory WHERE menu_item_id = $1", [id]);
  
    console.log("Seasonal removal success!");
    res.sendStatus(200);
    return;
  });

  SeasonalsRouter.post("/ingredient", async (req, res) => {
    let { ingname, stock, ingunit, min, max, restock, currprice } = req.body;

    // Ensure required fields are provided and process inputs
    console.log(typeof ingname);
    if (typeof ingname !== "string") {
      console.error("Invalid name");
      return res.sendStatus(400);
    }
    const sName = String(ingname).toLowerCase().replace(/ /g, "_").trim();

    const sStock = stock !== undefined ? parseFloat(stock) : NaN;
    const sMin = min !== undefined ? parseFloat(min) : NaN;
    const sMax = max !== undefined ? parseFloat(max) : NaN;
    const sRestock = restock !== undefined ? parseFloat(restock) : NaN;
    const sPrice = currprice !== undefined ? parseFloat(currprice) : NaN;

    // Validate numeric inputs
    if (
      isNaN(sStock) || sStock < 0 ||
      isNaN(sMin) || sMin < 0 ||
      isNaN(sMax) || sMax < 0 ||
      isNaN(sRestock) || sRestock < 0 ||
      isNaN(sPrice) || sPrice < 0
    ) {
      console.error("Invalid numeric values");
      return res.sendStatus(400);
    }


    try {
      const highIDResult = await client.query("SELECT MAX(ingredient_id) AS max FROM inventory");
      const highID = highIDResult.rows[0].max || 0;
      const id = highID + 1;

      await client.query("INSERT INTO inventory (ingredient_id, name, quantity_stock, unit, min_threshold, max_threshold, restock_quantity, current_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [id, sName, sStock, ingunit, sMin, sMax, sRestock, sPrice]
      );
      console.log("item successfully entered");
      res.sendStatus(200);
      return;
    } catch (error) {
      console.error("Error in adding ingredient: ", error.message);
      res.sendStatus(500);
      return;
    }
  });

export default SeasonalsRouter;