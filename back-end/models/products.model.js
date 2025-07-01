const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new Schema({
    product_code: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    img: { type: String, default: '' }
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema)