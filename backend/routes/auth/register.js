var express = require('express');
var router = express.Router();
const Model_Users = require('../../model/Model_Users')

router.post('/', async(req, res) => {
    const { nama, email, password, no_hp, role, nik, alamat, rt_rw } = req.body;
    if (!nama || !email || !password) {
        return res.status(400).json({ message: 'nama, email dan password harus diisi' })
    }

    try {
        const existingUser = await Model_Users.getByemail(email);
        if (existingUser) {
            return res.status(400).json({ message: "email sudah digunakan"})
        }
        await Model_Users.register({ nama, email, password, no_hp, role, nik, alamat, rt_rw });
        res.status(201).json({ message: 'Register berhasil' });
    }catch (err) {
        console.error(err);
        res.status(500).json({ message: 'terjadi kesalahan', error: err.message});
    }
})

module.exports = router;
