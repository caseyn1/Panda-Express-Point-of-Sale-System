// Import the 'pg' library
import pkg from 'pg';
const { Client } = pkg;

// Database connection configuration
const client = new Client({
  host: 'csce-315-db.engr.tamu.edu',
  database: 'csce331_53',
  user: 'csce331_53',
  password: 'ChurchOfLightFoot',
  port: 5432,
});

// Connect to the database and export the client
(async () => {
    try {
      await client.connect();
      console.log("Connected to PostgreSQL database successfully");
    } catch (err) {
      console.error("Database connection error:", err.stack);
    }
  })();
  
  export default client;
