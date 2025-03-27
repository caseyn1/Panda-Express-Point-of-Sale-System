import express from 'express'
const KioskRouter = express.Router()

import client from "../Database.js";

/**
 * Retrieves the list of menu items and their details from the database.
 * This route performs a `LEFT JOIN` on the `menu_items` and `menu_items_info` tables to fetch
 * the necessary information such as name, item type, price, nutritional information, spicy level,
 * premium status, and allergens. Default values are used for missing data.
 * 
 * The results are ordered by `menu_item_id` in ascending order and returned as a JSON response.
 * 
 * @route GET /kiosk
 * @returns {Object[]} Array of menu items with their details.
 */ 
KioskRouter.get('/', async (req, res) => {
    try {
      const results = await client.query(`
      SELECT mi.menu_item_id, 
      mi.name, mi.item_type, mi.price, 
      COALESCE(mii.calories, 0) AS calories, 
      COALESCE(mii.protein, 0) AS protein, 
      COALESCE(mii.carbohydrate, 0) AS carbohydrate, 
      COALESCE(mii.saturated_fat, 0) AS saturated_fat, 
      COALESCE(mii.spicy, false) AS spicy, 
      COALESCE(mii.premium, false) AS premium,
      COALESCE(mii.allergens, 'None') AS allergens 
      FROM menu_items mi 
      LEFT JOIN menu_items_info mii 
      ON mii.menu_item_id = mi.menu_item_id
      ORDER BY mi.menu_item_id ASC
        `);
      res.json(results.rows);
    } catch (err) {
      console.error(err.message);
    }
});

/**
 * Retrieves the most recent order ID from the `orders` table.
 * This route queries the `orders` table to get the most recent `order_id` by ordering it in descending 
 * order and limiting the results to just the latest order.
 * 
 * If an order exists, the `order_id` is returned as a JSON response. 
 * If no orders are found, a 404 status code is returned with a message indicating no orders exist.
 * 
 * @route GET /kiosk/nextorder
 * @returns {Object} The most recent order ID in the format `{ order_id: <order_id> }`.
 */ 
KioskRouter.get('/nextorder', async (req, res) => {
  try{
    const result = await client.query (`SELECT order_id from orders ORDER BY order_id desc LIMIT 1`);
    if (result.rows.length > 0) {
      const orderId = result.rows[0].order_id;
      res.json({ order_id: orderId });  // Send the order_id as a JSON response
    } else {
      res.status(404).json({ message: "No orders found" }); // Handle case if no orders exist
    }
  } catch (err){
    console.error(err.message);
  }
})

/**
 * Processes a new order by inserting data into the `orders`, `menu_orders`, and `currentorders` tables.
 * This route handles the creation of a new order in the database, including the following:
 * 1. Inserting the order details into the `orders` table.
 * 2. Inserting each item in the order into the `menu_orders` table.
 * 3. Inserting the grouped order items (such as meals, sides, and a la carte items) into the `currentorders` table.
 * 
 * The route expects a request body with the following fields:
 * - `total`: The total price for the order.
 * - `order`: An object containing the menu items ordered.
 * - `groupedOrder`: An array of grouped items (meal, sides, entrees, and a la carte).
 * - `rating`: A numerical rating for the order (from 1 to 5).
 * 
 * @route POST /kiosk/database
 * @param {Object} req.body The request body containing order information.
 * @param {number} req.body.total The total price for the order.
 * @param {Object} req.body.order The items ordered, categorized by their types.
 * @param {Array} req.body.groupedOrder Grouped order items (meal, sides, entrees, a la carte).
 * @param {number} req.body.rating The rating for the order.
 * @returns {Object} A response with status code 200 indicating success, or an error if something goes wrong.
 */ 
KioskRouter.post('/database', async (req, res) => {
  const {total, order, groupedOrder, rating} = req.body;
  
  const timestamp = new Date();
  const currentTimeFormatted = timestamp.toLocaleString();

  let latest_order_query = await client.query(`SELECT order_id from orders ORDER BY order_id desc LIMIT 1`)
  let latest_order_item_query = await client.query(`SELECT menu_order_id from menu_orders ORDER BY menu_order_id desc LIMIT 1`)
  let latest_kitchen_item_query = await client.query(`SELECT menu_order_id from currentorders ORDER BY menu_order_id desc LIMIT 1`)

  const latest_order_id = latest_order_query.rows[0]['order_id']
  const latest_order_item_id = latest_order_item_query.rows[0]['menu_order_id']
  let latest_kitchen_item_id = 0; 

  //If no rows are retrieved from menu_order_id(currentorders) start at 1 
  if (latest_kitchen_item_query.rows.length > 0) {
    latest_kitchen_item_id = latest_kitchen_item_query.rows[0]['menu_order_id'];
  }

  const new_order_id = latest_order_id + 1
  let new_order_item_id = latest_order_item_id + 1
  let new_kitchen_item_id = latest_kitchen_item_id + 1

  // insert into order table
  await client.query(`INSERT INTO orders (order_id, employee_id, timestamp, total, review, reportable) VALUES ($1, 0, $2, $3, $4, true)`, [new_order_id, timestamp, parseFloat(total), parseInt(rating)]);
  Object.keys(order).map(key => {
    let items = order[key]

    items.map(async item => {
      await client.query(`INSERT INTO menu_orders (menu_order_id, order_id, menu_item_id, quantity) VALUES ($1, $2, $3, 1)`, [new_order_item_id, new_order_id, parseInt(item['menu_item_id']) ])
      new_order_item_id += 1
    })
  })
  for(const item of groupedOrder){
    //console.log(groupedOrder);
    let itemNumGroup = item.groupNum;
    if(item.type === "MEAL"){
      //console.log("This is group: ", item.groupNum)
      //console.log("I am the meal: ", item.meal.name); 
      await client.query(`INSERT INTO currentorders (menu_order_id, order_id, menu_item_id, quantity, order_created, itemgroup) VALUES ($1, $2, $3, 1, $4, $5)`, 
        [new_kitchen_item_id, new_order_id, parseInt(item.meal.menu_item_id), currentTimeFormatted, parseInt(itemNumGroup)]
      )
      new_kitchen_item_id += 1; 
      for(const side of item.sides){
        await client.query(`INSERT INTO currentorders (menu_order_id, order_id, menu_item_id, quantity, order_created, itemgroup) VALUES ($1, $2, $3, 1, $4, $5)`, 
          [new_kitchen_item_id, new_order_id, parseInt(side.menu_item_id), currentTimeFormatted, parseInt(itemNumGroup)]
        )
        new_kitchen_item_id += 1; 
        //console.log("My SIDE From gorup ",itemNumGroup, " is ", side.name);
      }

      for(const entree of item.entrees){
        await client.query(`INSERT INTO currentorders (menu_order_id, order_id, menu_item_id, quantity, order_created, itemgroup) VALUES ($1, $2, $3, 1, $4, $5)`, 
          [new_kitchen_item_id, new_order_id, parseInt(entree.menu_item_id), currentTimeFormatted, parseInt(itemNumGroup)]
        )
        new_kitchen_item_id += 1;
        //console.log("My ENTREE From gorup ",itemNumGroup, " is ", entree.name);
      }
    }else if (item.type === "LACARTE"){

      await client.query(`INSERT INTO currentorders (menu_order_id, order_id, menu_item_id, quantity, order_created, itemgroup) VALUES ($1, $2, $3, 1, $4, $5)`, 
        [new_kitchen_item_id, new_order_id, parseInt(item.size.menu_item_id), currentTimeFormatted, parseInt(itemNumGroup)]
      )
      new_kitchen_item_id += 1;

      await client.query(`INSERT INTO currentorders (menu_order_id, order_id, menu_item_id, quantity, order_created, itemgroup) VALUES ($1, $2, $3, 1, $4, $5)`, 
        [new_kitchen_item_id, new_order_id, parseInt(item.item.menu_item_id), currentTimeFormatted, parseInt(itemNumGroup)]
      )
      new_kitchen_item_id += 1;

    }else{
      await client.query(`INSERT INTO currentorders (menu_order_id, order_id, menu_item_id, quantity, order_created, itemgroup) VALUES ($1, $2, $3, 1, $4, $5)`, 
        [new_kitchen_item_id, new_order_id, parseInt(item.item.menu_item_id), currentTimeFormatted, parseInt(itemNumGroup)]
      )
      new_kitchen_item_id += 1; 
    }   
  }

  res.sendStatus(200)
})

/**
 * Processes a new order by updating the inventory based on the ordered items.
 * This route handles deducting the required quantity of ingredients from the inventory
 * for each item in the order. It ensures that inventory levels are updated accurately
 * while preventing negative stock levels.
 * 
 * @route PUT /updateInventory
 * @param {Object} req.body The request body containing the order details.
 * @param {Object} req.body.order The ordered items categorized by type (e.g., "SIDE", "ENTREE", "LACARTE").
 * @param {Array} req.body.CARTEITEMS For "LACARTE" items, an array of additional menu items corresponding to indices in the order.
 * @returns {Object} A response with status code 200 indicating success, or an error if something goes wrong.
 */
KioskRouter.put('/updateInventory', async (req, res) => {
  const { order} = req.body;
  let inventoryquery = `SELECT mi.menu_item_id,
                        mi.ingredient_id,
                        mi.quantity_used,
                        inv.name,
                        inv.quantity_stock 
                        FROM menu_items_inventory mi
                        JOIN inventory inv
                        ON mi.ingredient_id = inv.ingredient_id
                        WHERE mi.menu_item_id = $1`

  let updateQuery = `UPDATE inventory
                      SET quantity_stock = GREATEST(quantity_stock - $1, 0)
                      WHERE ingredient_id = $2`

  Object.keys(order).map(key => {
    if(key === "SIDE" || key === "ENTREE" || key === "LACARTE" ){
      let items = order[key]; 
      items.map(async (item, index) => {
        let inventoryData = ''; 
        let amountToRemove = 0.0; 
        if(item.item_type === "LACARTE"){
          let carteItem = order["CARTEITEMS"][index]; 
          inventoryData = await client.query(inventoryquery,[carteItem.menu_item_id]);
          inventoryData.rows.map(async (ingredient) => {
            if(item.name.includes("Small")){
              amountToRemove = ingredient.quantity_used
            }else if (item.name.includes("Medium")){
              amountToRemove = ingredient.quantity_used * 1.5;
            }else{
              amountToRemove = ingredient.quantity_used * 2;
            }
            await client.query(updateQuery,[amountToRemove, ingredient.ingredient_id]);
          })
        }else{
          inventoryData = await client.query(inventoryquery,[item.menu_item_id]); 
          inventoryData.rows.map(async (ingredient) => {
            if(item.item_type === "SIDE"){
              amountToRemove = ingredient.quantity_used * 0.5; 
            }else{
              amountToRemove = ingredient.quantity_used; 
            } 
            await client.query(updateQuery,[amountToRemove, ingredient.ingredient_id]);
          })
        }
      })
    }
  })

  res.sendStatus(200)
})

export default KioskRouter; 