const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");

// CRUD dịch vụ
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);

router.get("/:serviceId/reviews", serviceController.getReviewsForService);
router.post("/:serviceId/reviews", serviceController.addReviewToService);

router.post("/", serviceController.createService);
router.put("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

module.exports = router;
