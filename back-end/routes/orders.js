var express = require('express');
var router = express.Router();
const Order = require('../models/orders.model');
const Product = require('../models/products.model');
const User = require('../models/users.model');

const generateOrderId = async () => {
    const count = await Order.countDocuments();
    const orderNumber = String(count + 1).padStart(3, '0');
    const date = new Date();
    const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    return `ORD${yearMonth}${orderNumber}`;
};

router.post('/', async (req, res) => {
    const { customer, items } = req.body;
    try {
        const user = await User.findById(customer);
        if (!user) {
            return res.status(404).json({ error: `Customer not found: ${customer}` });
        }
        let total_price = 0;
        const updatedProduct = [];

        for (const item of items) {
            const product = await Product.findOne({ product_code: item.product });
            if (!product) {
                return res.status(404).json({ error: `Product not found: ${item.product}` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ error: `Product '${product.name}' not enough in stock` });
            }
            product.quantity -= item.quantity;
            total_price += product.price * item.quantity;
            updatedProduct.push(product);
        }
        const order_id = await generateOrderId();

        const order = new Order({
            order_id,
            customer,
            items,
            total_price
        });
        await order.save();

        for (const p of updatedProduct) {
            await p.save();
        }
        res.status(201).json({ message: 'Create order success', order });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const order = await Order.find({});
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({ order_id: id });

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json(err.message);
    }
});

router.get('/customer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const orders = await Order.find({ customer: id });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this customer.' });
        }
        const ordersWithProductNames = await Promise.all(orders.map(async (order) => {
            const itemsWithNames = await Promise.all(order.items.map(async (item) => {
                const product = await Product.findOne({ product_code: item.product });
                return {
                    name: product ? product.name : "Unknown Product",
                    quantity: item.quantity
                };
            }));
            return {
                order_id: order.order_id,
                customer: order.customer,
                items: itemsWithNames,
                total_price: order.total_price
            };
        }));
        console.log(JSON.stringify(ordersWithProductNames, null, 2));
        res.status(200).json(ordersWithProductNames);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
