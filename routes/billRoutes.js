const express = require("express");
const billController = require("../controllers/billController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/billing-list", authController.protect, billController.getBillList);
router.post("/add-billing", authController.protect, billController.addBill);
router.patch(
  "/update-billing/:id",
  authController.protect,
  billController.updateBill
);
router.delete(
  "/delete-billing/:id",
  authController.protect,
  billController.deleteBill
);

module.exports = router;
