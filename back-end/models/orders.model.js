const mongoose = require('mongoose')
const { Schema } = mongoose

const orderSchema = new Schema({
    order_id: { type: String, unique: true, required: true},
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    total_price: { type: Number, required: true }
}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)