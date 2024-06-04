const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  date: Date,
  reviewerName: String,
  reviewerEmail: String
});

const DimensionsSchema = new mongoose.Schema({
  width: Number,
  height: Number,
  depth: Number
});

const MetaSchema = new mongoose.Schema({
  createdAt: Date,
  updatedAt: Date,
  barcode: String,
  qrCode: String
});

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

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
