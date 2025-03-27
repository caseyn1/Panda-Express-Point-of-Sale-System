import express from "express";
const EmployeesRouter = express.Router();

import client from "../Database.js";
import { isPIN } from "../util/helperFunctions.js";

EmployeesRouter.get("/", async (req, res) => {
  try {
    const results = await client.query(
      `SELECT * FROM employee ORDER BY employee_id ASC`
    );
    res.json(results.rows);
  } catch (err) {
    console.error(err.message);
  }
});

EmployeesRouter.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await client.query("SELECT * FROM employee WHERE sub = $1", [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

EmployeesRouter.post("/", async (req, res) => {
  try {
    const { userId, role = -1, name } = req.body;

    console.log(req.body);
    console.log("ADDING NEW EMPLOYEE");

    if (role < -1 || role > 4) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be between 0-4" });
    }

    const existingUser = await client.query(
      "SELECT * FROM employee WHERE sub = $1",
      [userId]
    );

    if (existingUser.rows.length > 0) {
      return res.json(existingUser.rows[0]);
    }

    let high_ID_query = await client.query(
      `SELECT MAX(employee_id) FROM employee`
    );
    const high_ID = high_ID_query.rows[0]["max"];

    await client.query(
      "INSERT INTO employee (employee_id, first_name, last_name, position, is_active, pin_id, role, sub) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        high_ID + 1,
        name.split(" ")[0],
        name.split(" ")[1],
        "None",
        true,
        high_ID + 1 * 1000,
        -1,
        userId,
      ]
    );

    res.status(201).json({ message: "Employee added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

EmployeesRouter.post("/add", async (req, res) => {
  const { first_name, last_name, position, pin_id } = req.body;
  // Check if any fields were blank
  if (
    first_name === "" ||
    last_name === "" ||
    position === "" ||
    !isPIN(pin_id)
  ) {
    res.sendStatus(400);
    return;
  }
  let high_ID_query = await client.query(
    `SELECT MAX(employee_id) FROM employee`
  );
  const high_ID = high_ID_query.rows[0]["max"];

  await client.query(
    "INSERT INTO employee (employee_id, first_name, last_name, position, is_active, pin_id) VALUES ($1, $2, $3, $4, true, $5) RETURNING *",
    [high_ID + 1, first_name, last_name, position, pin_id]
  );

  res.sendStatus(200);
  // res.status(201).json(newUser.rows[0]);
});

EmployeesRouter.post("/position", async (req, res) => {
  const { id, selectedPosition } = req.body;
  try {
    await client.query(
      "UPDATE employee SET position = $1 WHERE employee_id = $2",
      [selectedPosition, id]
    );
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

EmployeesRouter.post("/role", async (req, res) => {
  const { id, selectedRole } = req.body;
  try {
    await client.query("UPDATE employee SET role = $1 WHERE employee_id = $2", [
      selectedRole,
      id,
    ]);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

EmployeesRouter.post("/name", async (req, res) => {
  const { id, first_name, last_name } = req.body;
  try {
    await client.query(
      "UPDATE employee SET (first_name, last_name) = ($1, $2) WHERE employee_id = $3",
      [first_name, last_name, id]
    );
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

EmployeesRouter.post("/active", async (req, res) => {
  const { id, activeBool } = req.body;
  try {
    await client.query(
      "UPDATE employee SET is_active=$1 WHERE employee_id = $2",
      [activeBool, id]
    );

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

EmployeesRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("Removing employee #", id, "...");

  await client.query("DELETE FROM employee WHERE employee_id = $1", [id]);

  console.log("Employee removal success!");
  res.sendStatus(200);
});

export default EmployeesRouter;
