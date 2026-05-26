var express = require('express');
var router = express.Router();
const Model_Users = require('../../model/Model_Users')
var verifyToken = require('../../config/middleware/auth')
router.post('/', async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'email dan password harus diisi' })
    }

    try {
        const result = await Model_Users.login(email, password);
        res.json(result);
    }catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
})

module.exports = router;
