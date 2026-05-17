const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// SIGNUP
exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  // Basic validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: "Please provide a valid email address." });
  }

  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, message: "User created!" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "The password you entered is incorrect." });

    // Create the Token (The ID Card)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
