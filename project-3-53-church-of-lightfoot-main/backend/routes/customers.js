/**
 * CustomersRouter Module
 *
 * @description Express router module for handling customer reward operations, 
 *              such as checking if an email exists, creating a new user, 
 *              adding points to a user's account, and redeeming points.
 */

import express from "express";
const CustomersRouter = express.Router();
import client from "../Database.js";

/**
 * GET /check-email
 *
 * @description Checks if a user email exists in the database and retrieves their current points if they exist.
 * 
 * @query {string} email - The email address to check.
 * 
 * @returns {Object} JSON response indicating whether the email exists and the user's points.
 */
CustomersRouter.get("/check-email", async (req, res) => {
  const { email } = req.query;

  try {
    const query = `
      SELECT email, points 
      FROM users 
      WHERE email = $1
    `;
    const result = await client.query(query, [email]);

    if (result.rows.length > 0) {
      res.json({
        exists: true,
        points: result.rows[0].points,
      });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking email:", err.message);
    res.status(500).send("Server error");
  }
});

/**
 * POST /create
 *
 * @description Creates a new user in the database with the provided email. 
 *              If the email already exists, the operation is skipped.
 * 
 * @body {string} email - The email address of the new user.
 * 
 * @returns {Object} JSON response indicating success or failure.
 */
CustomersRouter.post("/create", async (req, res) => {
  const { email } = req.body;

  try {
    const query = `
      INSERT INTO users (email, points)
      VALUES ($1, 0)
      ON CONFLICT (email) DO NOTHING
      RETURNING user_id;
    `;
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(409).json({ success: false, message: "Email already exists." });
    }

    res.json({ success: true, userId: result.rows[0].user_id });
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).send("Failed to create user");
  }
});

/**
 * POST /add-points
 *
 * @description Adds points to a user's account after ordering.
 * 
 * @body {string} email - The email address of the user.
 * @body {number} points - The number of points to add.
 * 
 * @returns {Object} JSON response indicating success or failure, including the user's updated points.
 */
CustomersRouter.post('/add-points', async (req, res) => {
  const { email, points } = req.body;

  if (!email || !points) {
    return res.status(400).json({ success: false, message: "Email and points are required." });
  }

  try {
    const query = `
      UPDATE users 
      SET points = points + $1 
      WHERE email = $2 
      RETURNING points;
    `;
    const result = await client.query(query, [points, email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, points: result.rows[0].points });
  } catch (error) {
    console.error("Error adding points:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

/**
 * POST /redeem-points
 *
 * @description Updates a user's points to the remaining amount after redeeming points.
 * 
 * @body {string} email - The email address of the user.
 * @body {number} remainingPoints - The updated amount of points after redemption.
 * 
 * @returns {Object} JSON response indicating success or failure, including the user's updated points.
 */
CustomersRouter.post('/redeem-points', async (req, res) => {
  const { email, remainingPoints } = req.body;

  if (!email || remainingPoints == null) {
    return res.status(400).json({ success: false, message: "Email and remaining points are required." });
  }

  try {
    const updateQuery = `
      UPDATE users
      SET points = $1
      WHERE email = $2
      RETURNING points;
    `;
    const updateResult = await client.query(updateQuery, [remainingPoints, email]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      remainingPoints: updateResult.rows[0].points,
    });
  } catch (err) {
    console.error("Error updating points:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

export default CustomersRouter;