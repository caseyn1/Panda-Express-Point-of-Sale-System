import express from "express";
const ReviewsRouter = express.Router();
import client from "../Database.js";

/**
 * GET /reviews
 * Fetches reviews based on the date range provided.
 */
ReviewsRouter.get("/", async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const results = await client.query(
      `SELECT 
        order_id, 
        employee_id, 
        timestamp, 
        review, 
        reportable 
      FROM orders
      WHERE timestamp >= $1 AND timestamp <= $2
      ORDER BY timestamp DESC`,
      [startDate, endDate]
    );

    res.json(results.rows);
  } catch (err) {
    console.error("Error fetching review data:", err.message);
    res.status(500).send("Error fetching review data");
  }
});

export default ReviewsRouter;

