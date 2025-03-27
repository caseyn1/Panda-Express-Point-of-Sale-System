import express from "express";
const UserRouter = express.Router();

import client from "../Database.js";

/**
 * @route GET /{userId}
 * @group Users - Operations about users
 * @param {string} userId.path.required - ID of the user
 * @returns {object} 200 - User object
 * @returns {Error} 404 - User not found
 * @returns {Error} 500 - Server error
 */
UserRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await client.query("SELECT * FROM user_roles WHERE user_id = $1", [userId]);

    console.log(result);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route POST /
 * @group Users - Operations about users
 * @param {object} user.body.required - User object
 * @param {string} user.body.userId.required - ID of the user
 * @param {number} user.body.role - Role of the user (0-4)
 * @param {string} user.body.name.required - Name of the user
 * @returns {object} 201 - Created user object
 * @returns {Error} 400 - Invalid role
 * @returns {Error} 500 - Server error
 */
UserRouter.post("/", async (req, res) => {
  try {
    const { userId, role = 1, name } = req.body;

    if (role < 0 || role > 4) {
      return res.status(400).json({ message: "Invalid role. Must be between 0-4" });
    }

    const existingUser = await client.query("SELECT * FROM user_roles WHERE user_id = $1", [userId]);

    if (existingUser.rows.length > 0) {
      return res.json(existingUser.rows[0]);
    }

    const newUser = await client.query("INSERT INTO user_roles (user_id, role, name) VALUES ($1, $2, $3) RETURNING *", [userId, role, name]);

    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default UserRouter;
