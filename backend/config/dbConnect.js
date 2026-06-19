const {
  default: mongoose,
} = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb+srv://thuan2251220047_db_user:<db_password>@cluster0.wqmixy5.mongodb.net/<Cluster0>"
    );
    console.log("✓ Database connected successfully");
  } catch (error) {
    console.error("✗ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
