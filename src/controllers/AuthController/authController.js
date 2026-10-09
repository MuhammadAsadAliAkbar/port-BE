import User from '../../models/AuthModel/authModel.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import validator from 'validator'

const register = async (req, res) => {
    const { username, email, password, confirmPass } = req.body

    if (!username || !email || !password || !confirmPass) {
        return res.status(400).json({
            success: false,
            error: 'Please fill out all fields'
        })
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Email'
        })
    }

    const isExistUser = await User.findOne({ email })

    if (isExistUser) {
        return res.status(400).json({
            success: false,
            error: 'Email already exists has been taken'
        })
    } else if (password !== confirmPass) {
        return res.status(400).json({
            success: false,
            error: "Password does'nt match"
        })
    }

    if (password.length < 6 || confirmPass.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 6 characters long'
        })
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const hashConfirmPass = await bcrypt.hash(confirmPass, 10)

    const user = new User({
        username,
        email,
        password: hashPassword,
        confirmPass: hashConfirmPass
    })

    const userData = await user.save()

    if (userData) {
        return res.status(200).json({
            success: true,
            message: "user create successfully",
            data: userData
        })
    }

    else {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

const signin = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        // const expiresIn = 24 * 60 * 60 * 1000;
        const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
            expiresIn: '7d'
        });

        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
            expiresIn: '7d'
        })


        const users = await User.findOne({ is_active: user.is_active })

        if (!users.is_active) {
            return res.status(400).send({
                success: false,
                error: "This account is in-active, please contact your admin",
            });
        }

        return res.json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                tokenType: 'Bearer',
                is_active: user.is_active,
                is_admin: user.is_admin,
                image: user.image,
                is_login: user.is_login,
                expiryAt: user.expiryAt,
            },
            message: "Login successfully"
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
        console.log(err, 'error');


    }

}

const logout = async (req, res) => {

    const { id } = req.query

    if (!id) {
        return res.status(400).json({ success: false, error: "User ID is required for logout." });
    }

    const data = await User.updateOne(
        { _id: id },
        { $set: { token: null, is_login: false } },
    )

    if (data.nModified === 0) {
        return res.status(404).json({ success: false, error: "User not found or already logged out." });
    }

    return res.status(200).json({ success: true, message: "Successfully logged out." });
}

export {
    register,
    logout,
    signin
}