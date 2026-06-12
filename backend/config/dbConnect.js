const {
  default: mongoose,
} = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb+srv://thuan2251220047_db_user:snKYur2AQ1dw5Dph@cluster0.wqmixy5.mongodb.net/?appName=Cluster0"
    );
    console.log("✓ Database connected successfully");
  } catch (error) {
    console.error("✗ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = dbConnect;
