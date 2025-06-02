import jwt from 'jsonwebtoken';
import pool from "../model/db.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto'

const saltRound = 10

// function definitions for certain tasks
const hashPassword = async (password) => {
  try{
    const hash = await bcrypt.hash(password, saltRound);
    return hash
  }catch (err){
    throw err
  }
}

const generateJwtToken = async (id, username ) => {
  try {
     
      // const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5min
      // const expiresInSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000); // time in sec
      const expiresInSeconds = 10 * 60;
      const expiresAt = new Date((Date.now() + expiresInSeconds * 1000));
     // jwt.sign(payload, secretkey)
      const token = jwt.sign( {id, username} , process.env.JWT_SECRET_KEY, {expiresIn: '15s'});

      // adding the token to sessions table
      const insertTokenQuery = "INSERT INTO sessions(user_id, token, expires_at) values($1,$2,$3) RETURNING*";
     
      const insertTokenValues = [id, token, expiresAt];

      const tokenInsertResult = await pool.query(insertTokenQuery, insertTokenValues);

      if(tokenInsertResult.rows.length > 0){
        return { success: true, token : tokenInsertResult.rows[0].token, expiresAt: tokenInsertResult.expiresAt}
      }

      return {success: false}
  } catch (error) {
     throw error
  }
}

//
// Funcition definition for routes
const register = async (req, res) => {
  try {
    
    const {username, email, password, confirmPassword } = req.body;

    if(password !== confirmPassword){
      return res.status(409).json({success: false , message: "passwords do not match"})
    }

    // checking if user with the username already exist
    const checkUserQuery = "SELECT username FROM users WHERE username = ($1)";
    const checkResults = await pool.query(checkUserQuery, [username]);

    if (checkResults.rows.length > 0){
      return res.status(409).json({success: false , message: "username already taken"})
    }

    const passwordHash = await hashPassword(password);

    const query = "INSERT INTO users (username, password_hash, email) VALUES($1,$2,$3) RETURNING*"
    const values = [username, passwordHash, email]

    

    const results = await pool.query(query, values);

    if (results.rows.length > 0){
     
      const id = results.rows[0].id

      // generate token
      const tokenGeneration = await  generateJwtToken(id, username);

      if (tokenGeneration.success){
        
        return res.status(201).json(
          { 
            success : true,
            message: 'Registration sucess',
             data: {id, username},
             token: tokenGeneration.token ,
             expiresAt: tokenGeneration.expiresAt }
        );
      }

      return res.status(500).json({ success: false, message: "user registered but failed to login"});

    }
    
    return res.status(401).json({success: false , message: "Registration failed", data: []})
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
  
};

const login = async (req, res)=>{
  try {
    const {email, password} = req.body;

    const checkUserQuery = "SELECT * FROM users WHERE email = ($1)";
    const checkUserResults = await pool.query(checkUserQuery, [email]);

    if (checkUserResults.rows.length > 0){
      const passwordHash = checkUserResults.rows[0].password_hash;
      const passwordMatch = await bcrypt.compare(password, passwordHash);

      if (!passwordMatch){
        return res.status(401).json({success: false, message: "incorrect email or password"})
      }

      const username = checkUserResults.rows[0].username
      const id = checkUserResults.rows[0].id
      
     /// generate acess token
     const tokenGeneration = await generateJwtToken(id, username);

     // generate refresh token 
     const refreshToken = crypto.randomBytes(64).toString('hex');
     const expires_at= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

     // store refresh token in db
     const storeRefreshTokenQuery = "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES($1, $2, $3) returning*"
     const rfToken = await pool.query(storeRefreshTokenQuery, [id, refreshToken, expires_at])
     

      if(tokenGeneration.success){

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production", // only use secure cookies in production
          secure: true,
          sameSite: "none",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        });

        const user = checkUserResults.rows[0]
        


        return res.status(200).json(
          { 
            success: true,
            message: 'user loggedin',
            data: {id, username},
            token: tokenGeneration.token ,
            expiresAt: tokenGeneration.expiresAt ,
            // rfToken : rfToken.rows[0]
          }
        );
        
      }



      return res.status(401).json({success: false, message: "login failed", data: []})
    }

    return res.status(404).json({ success: false, message: 'user not found please register first'});
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
  
};


// validate token from frontend
const validateToken = async (req, res) => {
  try{

    return res.status(200).json({
        success: true,
        message: "Token is valid",
        // user: {id: req.user.id, username: req.user.username},
    })

  }catch(error){
     return res.status(500).json({
      success: false,
      message: "Something went wrong during token validation",
      error: error.message,
    });
  }
}

// refresh token route
const refreshToken = async (req, res) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    // console.log(refreshTokenFromCookie)

    if (!refreshTokenFromCookie) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    // Look up the refresh token in DB
    const query = "SELECT * FROM refresh_tokens WHERE token = $1";
    const result = await pool.query(query, [refreshTokenFromCookie]);

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Invalid refresh token" });
    }

    const storedToken = result.rows[0];

    // Check expiration
    if (new Date() > storedToken.expires_at) {
      // Optionally delete the expired token here
      await pool.query("DELETE FROM refresh_tokens WHERE id = $1", [storedToken.id]);

      return res.status(403).json({ success: false, message: "Refresh token expired" });
    }

    // If valid, generate a new access token
    // You might want to fetch the user info from users table here for username, etc.
    const userQuery = "SELECT username FROM users WHERE id = $1";
    const userResult = await pool.query(userQuery, [storedToken.user_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const username = userResult.rows[0].username;
    const newGeneratedTokenData = await generateJwtToken(storedToken.user_id, username)
    const newAccessToken = newGeneratedTokenData.token

    // (Optional) Generate a new refresh token, store it, delete the old one
    // For simplicity, here we keep the same refresh token

    return res.status(200).json({
      success: true,
      message: "token refreshed ",
      token: newAccessToken,
    });

  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// loggout route

const logout = async (req, res) => {
    try{

      // get the refresh token from browser
      const refreshToken = req.cookies.refreshToken

      if(!refreshToken){
        return res.status(400).json({success: false, message: "no refresh token found"})
      }

      // delete the refresh token from the db
      const deleteRefreshTokenQuery = "DELETE FROM refresh_tokens where token = ($1)"
      await pool.query(deleteRefreshTokenQuery, [refreshToken])

      // clear the cookies by setting it to expire immediately
       res.cookie("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        expires: new Date(0), // Expire cookie immediately
      });

      // get user id from token in middlewere
      const userId = req.user.id

      // check if userId is not available
      if (!userId){
        return res.status(401).json({
          sucess: false,
          message: "user id not found"
        })
      }


      // query to delete the tokens from sessions table 
      const deleteUserTokensQuery = "DELETE FROM sessions WHERE user_id = ($1)"

      // peform the db operation to delelet the user tokens. 
      // the response holds the rowCount of how may rows were deleted
      const response = await pool.query(deleteUserTokensQuery, [userId])

      // check if any rows were deleted 
      if (response.rowCount > 0){
        
          // rows were deleted so its a success
          return res.status(200).json({
          success: true,
          message: "logged out",
          
        })
      }

     

      // it got here meaning there were no session in the db. 
       return res.status(401).json({
        success: false,
        message: "no session found",
      })

    }catch(error){
      // in case of error
      return res.status(500).json({
      success: false,
      message: "Something went wrong during logout",
      error: error.message
      })
    }
}


export {
  register, 
  login,
  refreshToken,
  validateToken,
  logout,
};