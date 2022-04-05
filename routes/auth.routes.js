const {Router} = require("express")
const bcrypt = require("bcrypt")
const config = require("config")
const jwt = require("jsonwebtoken")
const {check, validationResult} = require("express-validator")
const User = require("../models/User")
const router = Router()

module.exports = router

// /api/auth/register
    router.post(
        '/register',
        [
            check("email", "Netaisngas el. pastas").isEmail(),
            check("password", "Minipalus passwordo ilgis 6")
                .isLength({min: 6 })
        ],
        async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                message: "Neteisingos registracijos duomenys"
            })
        }
        const {email, password} = req.body
        const candidate = await User.findOne({email})
        if (candidate) {
            return res.status(400).json({message: "toks vartuotojas jau egzistuoja"})
        }

        const hashedPassword = await bcrypt.hash(password, 12)
        const user = new User({email, password: hashedPassword})
        await user.save()

        res.status(201).json({message: "vartuotojas sukurtas"})

        } catch (e) {
        res.status(500).json({message: 'kazkas netaip, bandykite vel'})
    }
})

// /api/auth/login
    router.post("/login",
        [
          check("email", "Iveskite taisnga slaptazodi").normalizeEmail().isEmail(),
            check("password", "iveskite slaptazodi").exists()
        ],
        async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
            errors: errors.array(),
            message: "Neteisingos duomenys prisijungiant"
            })
        }
        const {email, password} = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: "Vartuotojas nerastas"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
           if (!isMatch) {
            return res.status(400).json({message: "Neteisingas slaptazodys"})
        }
        const token = jwt.sign(
            {userId: user.id},
            config.get("jwtSecret"),
            {expiresIn: "1h"}
        )

        res.json({token, userId: user.id})

    } catch (e) {
        res.status(500).json({message: 'kazkas netaip, bandykite vel'})
    }
})

module.exports = router