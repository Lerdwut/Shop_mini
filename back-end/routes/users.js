var express = require('express');
var router = express.Router();
var User = require('../models/users.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

router.get('/', async (req, res) => {
  try {
    let user = await User.find({});
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, firstname, lastname, age, gender } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      firstname,
      lastname,
      age,
      gender
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully.',
      data: user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }
    const token = jwt.sign({ user_id: user._id, username: user.username, firstname: user.firstname, lastname: user.lastname, age: user.age, gender: user.gender }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful.', data: user, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

router.put('/:id', async (req, res) => {
  try {
    let { username, password, firstname, lastname, age, gender } = req.body;
    let { id } = req.params;
    
    // Prepare update data
    let updateData = { firstname, lastname, age, gender };
    
    // Only hash and update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    let user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if(!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully.', data: deletedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;