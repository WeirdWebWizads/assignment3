const userModel = require('../models/userModel');
const bcrypt = require("bcrypt");
const { validationResult } = require('express-validator');

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await userModel.getUserByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
        req.session.loggedin = true;
        req.session.username = username;
        req.session.user_id = user.id;
        res.redirect('/');
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
};

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, avatar } = req.body;
    const user = await userModel.getUserByUsername(username);

    if (user) {
        res.status(409).json({ error: 'Username already exists' });
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const data = '{}';
        const newUser = await userModel.createUser(username, hashedPassword, avatar, data);
        res.status(201).json({ message: 'User created', userId: newUser.insertId });
    }
};
