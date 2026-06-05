const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Branch = require("../models/BranchModel");

const seedUsers = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/manager-btaskee");
    console.log("✓ Kết nối MongoDB thành công");

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    console.log("✓ Đã xóa dữ liệu users cũ");

    // Lấy branch đầu tiên (nếu có)
    const branch = await Branch.findOne();

    // Tạo tài khoản admin
    const admin = new User({
      name: "Admin BTaskee",
      email: "admin@btaskee.com",
      phone: "0989123456",
      password: "Admin@123", // Sẽ được hash tự động
      role: "admin",
      branch: branch?._id || null,
    });
    await admin.save();
    console.log("✓ Tạo tài khoản admin: admin@btaskee.com");

    // Tạo tài khoản manager
    const manager = new User({
      name: "Manager BTaskee",
      email: "manager@btaskee.com",
      phone: "0989654321",
      password: "Manager@123",
      role: "manager",
      branch: branch?._id || null,
    });
    await manager.save();
    console.log("✓ Tạo tài khoản manager: manager@btaskee.com");

    // Tạo tài khoản staff
    const staff = new User({
      name: "Staff BTaskee",
      email: "staff@btaskee.com",
      phone: "0987123456",
      password: "Staff@123",
      role: "staff",
      branch: branch?._id || null,
    });
    await staff.save();
    console.log("✓ Tạo tài khoản staff: staff@btaskee.com");

    console.log("\n✅ Hoàn thành! Tài khoản được tạo:");
    console.log("  Admin: admin@btaskee.com / Admin@123");
    console.log("  Manager: manager@btaskee.com / Manager@123");
    console.log("  Staff: staff@btaskee.com / Staff@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
};

seedUsers();
