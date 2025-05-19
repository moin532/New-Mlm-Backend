// connectSqlDatabase.js
const { Pool } = require("pg");

const connectSqlDatabase = () => {
  const pool = new Pool({
    user: "lipuwuin_lipuwuin",
    host: "107.172.58.7",
    database: "lipuwuin_lipu_db",
    password: "SHE92.cshTyi",
    port: 5432, // ✅ Correct port for PostgreSQL
  });

  pool
    .connect()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch((err) => console.error("❌ Connection error", err.stack));
};

module.exports = connectSqlDatabase;
