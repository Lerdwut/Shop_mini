const mongoose = require('mongoose');
const  Product = require('../models/products.model');

const dbURI = 'mongodb://localhost:27017/workshop';
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');

  await Product.updateOne(
    { product_code: 'ELEC001' },
    { $set: { img: '' } }
  );

  console.log('Updated product image');
  process.exit();
})
.catch(err => {
  console.error('Connection error:', err);
});