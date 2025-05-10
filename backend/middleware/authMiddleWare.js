import express from 'express'
import jwt from 'jsonwebtoken'

const authenticateToken = (req, res, next) => {
    console.log(" check token called")

    const authHeader = req.headers['authorization']
    console.log(authHeader);
    try {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({sucess: false, message: "Access Denied, No token provided"})
         
        }

        const token = authHeader.split(' ')[1]
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decoded

        next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        return res.status(500).json({sucess: false, message: "server error", error: error.message})
    }
}

export {authenticateToken}