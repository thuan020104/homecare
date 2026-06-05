const {
  default: mongoose,
} = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/manager-btaskee"
    );
    console.log("✓ Database connected successfully");
  } catch (error) {
    console.error("✗ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
