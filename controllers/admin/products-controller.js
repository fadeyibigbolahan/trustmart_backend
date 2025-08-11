const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");
const Vendor = require("../../models/Vendor");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
    } = req.body;

    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    // ✅ Only allow approved vendors
    if (!vendor.isApproved) {
      return res.status(403).json({
        message:
          "Your vendor account is not approved yet. Please wait for approval before adding products.",
      });
    }

    if (!title || !price || !req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Title, price, and at least one image are required.",
      });
    }

    const imageUrls = req.files.map((file) => file.path); // Cloudinary URLs
    console.log("image urls", imageUrls);

    const product = new Product({
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      images: imageUrls,
      vendor: vendor._id,
    });

    await product.save();

    console.log("product saved");
    res.status(201).json({
      message: "Product created successfully.",
      product,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to create product.",
      error: err.message,
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

const fetchVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID is required",
      });
    }

    const listOfProducts = await Product.find({ vendor: vendorId });

    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      images,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("req.files", req);

    // Append new uploaded images to existing images
    if (images) {
      if (Array.isArray(images)) {
        findProduct.images = images;
      } else if (typeof images === "string") {
        findProduct.images = [images];
      } else {
        findProduct.images = []; // fallback in case of unexpected type
      }
    }

    // Update other fields
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.salePrice =
      salePrice === "" ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.averageReview = averageReview || findProduct.averageReview;

    await findProduct.save();

    res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  fetchVendorProducts,
  editProduct,
  deleteProduct,
};
