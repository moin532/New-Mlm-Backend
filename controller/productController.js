// controllers/productController.js
const Product = require("../models/productModel");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, Stock, id, price, discountprice } =
      req.body;
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }
    const images = files.map((file) => ({
      public_id: file.filename,
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    }));
    const product = new Product({
      name,
      description,
      category,
      Stock,
      images,
      price,
      discountprice,
      user: id || null, // If auth implemented
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllPRoducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products) {
      return res.status(200).json({
        succes: false,
        msg: "products does not found",
      });
    }

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      err: error,
    });
  }
};

exports.getAllAdminPrd = async (req, res) => {
  try {
    const seller_id = req.seller._id;

    const products = await Product.find({ seller_id }); // Use find() to get all products

    res.status(200).json({
      success: true,
      products, // Sending an array of products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message, // Send a proper error message
    });
  }
};

exports.UpdateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "product not found",
      });
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      useFindAndModify: false,
      runValidators: false,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      err: error,
    });
  }
};

exports.getSinglePrd = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      succes: false,
      err: error,
    });
  }
};

exports.dltPrd = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        msg: "product not found",
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      msg: "product successfully removed",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      succes: false,
      err: error,
    });
  }
};

exports.cretePrdReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find((elem) => {
      elem.toString() === req.user._id.toString();
    });

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      msg: "added  successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      succes: false,
      err: error,
    });
  }
};
