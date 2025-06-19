const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
  fetchVendorProducts,
} = require("../../controllers/admin/products-controller");

const { protect, role } = require("../../middlewares/authMiddleware");

// const { upload } = require("../../helpers/cloudinary");
const upload = require("../../middlewares/upload");

const router = express.Router();

// router.post("/upload-image", upload.single("my_file"), handleImageUpload);

// Route to add a product (only allowed for vendors)
router.post(
  "/add",
  protect,
  role("vendor"),
  upload.array("images", 5),
  addProduct
);

// Route to edit a product (should be allowed for the vendor who owns the product)
router.put(
  "/edit/:id",
  protect,
  role("vendor"),
  upload.array("images", 5),
  editProduct
);

// Route to delete a product (should be allowed for the vendor who owns the product)
router.delete("/delete/:id", protect, role("vendor"), deleteProduct);

// Route to fetch all products (no role check needed here, unless you want to restrict access)
router.get("/get", fetchAllProducts);

router.get("/get/:vendorId", fetchVendorProducts);

module.exports = router;
