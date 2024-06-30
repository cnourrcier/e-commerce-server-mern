const mongoose = require('mongoose');

// Schema for product reviews
const ReviewSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  date: Date,
  reviewerName: String,
  reviewerEmail: String
});

// Schema for product dimensions
const DimensionsSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  depth: Number
});

// Schema for product metadata
const MetaSchema = new mongoose.Schema({
  createdAt: Date,
  updatedAt: Date,
  barcode: String,
  qrCode: String
});

// Main schema for products
const ProductSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  category: String,
  price: Number,
  discountPercentage: Number,
  rating: Number,
  stock: Number,
  tags: [String],
  brand: String,
  sku: String,
  weight: Number,
  dimensions: DimensionsSchema,
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: String,
  reviews: [ReviewSchema],
  returnPolicy: String,
  minimumOrderQuantity: Number,
  meta: MetaSchema,
  images: [String],
  thumbnail: String
});

// Create the product model using the schema
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
