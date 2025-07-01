var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
var Product = require('../models/products.model');

const generateProductCode = async () => {
  const count = await Product.countDocuments();
  const productNumber = String(count + 1).padStart(3, '0');
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  return `P${yearMonth}${productNumber}`;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },     
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/', async (req, res) => {
  try {
    const product = await Product.find({});
    console.log(product);
    
    res.status(200).json({
        user: req.user,
        products: product
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({
      message: 'Product retrieved successfully.',
      data: product
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

router.post('/', upload.single('img'), async (req, res) => {
  try {
    let { name, description, price, quantity } = req.body;
    let img = req.file ? `images/${req.file.filename}` : '';
    if (!name || price == null || quantity == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const product_code = await generateProductCode();
    const product = new Product({
      product_code,
      name,
      description,
      price,
      quantity,
      img
    });
    await product.save();
    res.status(201).json({
      message: 'Product created successfully.',
      data: product
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', upload.single('img'), async (req, res) => {
  try {
    const { product_code, name, description, price, quantity } = req.body;
    const { id } = req.params;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const img = req.file ? `images/${req.file.filename}` : existingProduct.img;
    console.log(`Updating product with ID: ${id}, product_code: ${product_code}, name: ${name}, price: ${price}, quantity: ${quantity}, img: ${img}`);
    
    if (!product_code || !name || price == null || quantity == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { product_code, name, description, price, quantity, img },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({
      message: 'Product updated successfully.',
      data: updatedProduct
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({
      message: 'Product deleted successfully.',
      data: deletedProduct
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
});

module.exports = router;