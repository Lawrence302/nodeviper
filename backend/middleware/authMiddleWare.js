
import jwt from 'jsonwebtoken'

/**
 * 
 * middleware to authenticate token
 * receives token from header and validates it
 * allows the route to be accessed only if token is valid
 */
const authenticateToken = (req, res, next) => {
   
    // getting the authorization heder 
    const authHeader = req.headers['authorization']
    
    try {
        // check if there is a token in the authorization header passed
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({sucess: false, message: "Access Denied, No token provided"})
         
        }

        // get the token from the header . it is found as the second element in the array after Bearer when you split 
        const token = authHeader.split(' ')[1]
        
        // verify the token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decoded

        // proceed to the route
        next()
    } catch (error) {
        // in case if the token is expired
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        // incase of server error
        return res.status(500).json({sucess: false, message: "server error", error: error.message})
    }
}

export {authenticateToken}