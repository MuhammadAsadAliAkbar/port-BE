import jwt from 'jsonwebtoken'

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.body.query || req.headers["authorization"]

    if (!token) {
        return res.status(401).json({
            success: false,
            msg: "A token is required for authentication",
        })
    }

    const bearer = token.split(" ")
    const bearerToken = bearer[1]

    const decodedData = jwt.verify(bearerToken, process.env.SECRET_KEY)
    req.user = decodedData.user

    res.status(400).json({
        success: false,
        msg: "invalid token",
    });

    return next()
}

export {
    verifyToken
}