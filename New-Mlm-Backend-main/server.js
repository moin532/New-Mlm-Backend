const app = require("./app");
const connectDatabase = require("./config/Database");
const Admin = require("./models/adminModel"); // Import Admin model
const bcrypt = require("bcryptjs"); // Needed if hashing here, but better to use model method

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// Connect Database and Setup Default Admin
const startServer = async () => {
  try {
    await connectDatabase();

    // --- Setup Default Admin --- //
    const defaultAdminUsername = "admin";
    const defaultAdminPassword = "password123"; // Choose a secure default password

    const existingAdmin = await Admin.findOne({ username: defaultAdminUsername });

    if (!existingAdmin) {
      console.log(`Default admin (${defaultAdminUsername}) not found. Creating...`);
      const newAdmin = new Admin({
        username: defaultAdminUsername,
        name: "Default Admin" // Optional: Add a name
      });
      await newAdmin.setPassword(defaultAdminPassword); // Use the model method to hash password
      await newAdmin.save();
      console.log(`Default admin (${defaultAdminUsername}) created successfully.`);
    } else {
      console.log(`Default admin (${defaultAdminUsername}) already exists.`);
    }
    // --- End Default Admin Setup --- //

    const server = app.listen(process.env.PORT, () => {
      console.log(`Server is working on http://localhost:${process.env.PORT}`);
    });

    // Unhandled Promise Rejection
    process.on("unhandledRejection", (err) => {
      console.log(`Error: ${err.message}`);
      console.log(`Shutting down the server due to Unhandled Promise Rejection`);

      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error("Failed to connect to database or setup admin:", error);
    process.exit(1);
  }
};

startServer();

