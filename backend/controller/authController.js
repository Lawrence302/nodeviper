import jwt from 'jsonwebtoken';
import pool from "../model/db.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto'

const saltRound = 10 // salt round for hashing

// function for hashing user password
const hashPassword = async (password) => {
  try{
    // hashing user password using bcrypt
    const hash = await bcrypt.hash(password, saltRound);
    return hash // return password hash
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
      const token = jwt.sign( {id, username} , process.env.JWT_SECRET_KEY, {expiresIn: expiresInSeconds});

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
/**
 * Registers a new user.
 * @param {Request} req - Express request object containing user data.
 * @param {Response} res - Express response object.
 * @returns {JSON} Returns success or error response.
 */
const register = async (req, res) => {
  // #swagger.summary = 'User registration'
  // #swagger.tags = ['authentication']
  // #swagger.description = 'Register a new user with username, email, password, confirmPassword.'
  /* #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
          username: 'johnMax',
          email: 'john@example.com',
          password: '123456',
          confirmPassword: '123456'
      }
  } */
  /* #swagger.responses[201] = {
        description: 'User registered successfully',
        schema: { success: true, message: 'Registration success', data: { id : 4, username: 'johndoe', token: 'jwt token' } }
  } */
  /* #swagger.responses[400] = {
        description: 'passwords and confirmPassword do not match',
        schema: {sucess: false, message: "password and confirmPassword must be same"}
  } */
  /* #swagger.responses[409] = {
        description: 'username already exist OR email already exist',
        schema: {sucess: false, message: "username already taken / user already registered with this email"}
  } */
  /* #swagger.responses[500] = {
      description: 'Internal Server Error: Token generation failed or unexpected server error',
      schema: {
          success: false,
          message: 'User registered but failed to login or Server error or Registration failed'
      }
  } */
 
  try {
    
    // receives data from request body
    const {username, email, password, confirmPassword } = req.body;

    // check if password and confirmpassword are matching 
    if(password !== confirmPassword){
      return res.status(400).json({success: false , message: "password and confirmPassword must be same"})
    }

    // checking if user with the username already exist
    const checkUserQuery = "SELECT username FROM users WHERE username = ($1)";
    const checkResults = await pool.query(checkUserQuery, [username]);

    if (checkResults.rows.length > 0){
      return res.status(409).json({success: false , message: "username already taken"})
    }

    // check if email is already taken
    const checkEmailQuery = "SELECT email FROM users WHERE email = ($1)";
    const checkEmail = await pool.query(checkEmailQuery, [email])

    // check if email already exist
    if (checkEmail.rows.length > 0){
      return res.status(409).json({success: false , message: "user already registered with this email"})
    }

    // hash the input password
    const passwordHash = await hashPassword(password);

    // insert users data to database
    const query = "INSERT INTO users (username, password_hash, email) VALUES($1,$2,$3) RETURNING*"
    const values = [username, passwordHash, email]

    

    
    const results = await pool.query(query, values);
    // if data was added to db
    if (results.rows.length > 0){
     
      const id = results.rows[0].id

      // generate user access  token
      const tokenGeneration = await  generateJwtToken(id, username);

      // if the token generation was successful
      if (tokenGeneration.success){
        
        // sucessfull response sent
        return res.status(201).json(
          { 
            success : true,
            message: 'Registration success',
             data: {id, username},
             token: tokenGeneration.token 
          }
        );
      }

      // if there was an error generating token 
      return res.status(500).json({ success: false, message: "user registered but failed to login"});

    }
    // in case of error during user registration
    return res.status(500).json({success: false , message: "Registration failed"})

  } catch (error) {
    // in case of unknow server error
    return res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
  
};


/**
 * Login a user with email and password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res)=>{
  // #swagger.summary = 'User login'
  // #swagger.tags = ['authentication']
  // #swagger.description = 'Login with email and password to receive JWT access token and refresh token cookie.'
  /* #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
      email: 'john@example.com',
      password: '123456'
      }
  }*/
  /* #swagger.responses[200] = {
      description: 'User logged in successfully',
      schema: { 
        success: true,
        message: 'user loggedin',
        data: { id: 1, username: 'johnDoe' },
        token: 'jwt token',
        expiresAt: 'token expiry timestamp'
      }
  } */
  /* #swagger.responses[401] = {
       description: 'Incorrect email or password',
       schema: { success: false, message: 'incorrect email or password' }
  }*/
  /* #swagger.responses[404] = {
       description: 'User not found',
       schema: { success: false, message: 'user not found please register first' }
  } */
  /* #swagger.responses[500] = {
       description: 'Login failed due to server error or other operational erros',
       schema: { success: false, message: 'login failed' }
  } */
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



      return res.status(500).json({success: false, message: "login failed", data: []})
    }

    return res.status(404).json({ success: false, message: 'user not found please register first'});
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
  
};


// validate token from frontend
/**
 * @route Post / validateToken
 * @param {Request} req - Express request object (expects json token )
 * @param {Response} res - Express response object
 * @returns {JSON} - Sends JSON response with success status and token or error message
 */
const validateToken = async (req, res) => {
  // #swagger.summary = 'Validate JWT token'
  // #swagger.tags = ['authentication']
  // #swagger.security = [{ "bearerAuth": []}]
  // #swagger.description = 'Validate the access token sent from frontend'
  
  /* #swagger.responses[200] = {
      description: 'Token is valid',
      schema: { success: true,message: 'Token is valid' }
  } */
  /* #swagger.responses[500] = {
      description: 'Token validation failed due to server error',
      schema: { success: false, message: 'Something went wrong during token validation', error: 'Error message' }
  } */
  try{

    return res.status(200).json({
        success: true,
        message: "Token is valid",
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
/**
 * Refresh access token using the refresh token stored in cookies.
 * 
 * This endpoint verifies the refresh token, checks its validity and expiration,
 * then issues a new access token if everything is valid.
 * 
 * Possible responses:
 * - 200: New access token successfully generated.
 * - 401: No refresh token provided in cookies.
 * - 403: Refresh token is invalid or expired.
 * - 404: User associated with refresh token not found.
 * - 500: Server error during token refresh.
 * 
 * @route POST/ refreshToken
 * @param {Request} req - Express request object (expects cookie 'refreshToken')
 * @param {Response} res - Express response object
 * @returns {JSON} Sends JSON response with success status and token or error message
 */
const refreshToken = async (req, res) => {
  // #swagger.summary = 'Refresh access token'
  // #swagger.tags = ['authentication']
  /* #swagger.parameters['cookie'] = {
      in: 'cookie',
      name: 'refreshToken',
      required: true,
      type: 'string',
      description: 'Refresh token stored in HTTP-only cookie'
   } */
  // #swagger.description = 'Generate a new access token using a valid refresh token stored in cookies'
  /* #swagger.responses[200] = {
      description: 'New access token generated successfully',
      schema: { success: true, message: 'token refreshed', token: 'new_access_token_string' }
  } */
  /* #swagger.responses[401] = {
      description: 'No refresh token provided',
      schema: { success: false, message: 'No refresh token provided' }
  } */
  /* #swagger.responses[403] = {
      description: 'Invalid or expired refresh token',
      schema: { success: false, message: 'Invalid refresh token / Refresh token expired' }
  } */
  /* #swagger.responses[404] = {
      description: 'User associated with refresh token not found',
      schema: { success: false, message: 'User not found' }
  } */
  /* #swagger.responses[500] = {
      description: 'Server error during token refresh',
      schema: { success: false, message: 'Server error' }
  } */
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
/**
 * Logs out the user by:
 * - Clearing the refresh token cookie
 * - Deleting the refresh token from the database
 * - Removing the user's active sessions
 * 
 * @route POST /logout
 * @access Private (Requires valid access token via middleware)
 * @returns {Object} JSON response indicating success or failure
 */
const logout = async (req, res) => {
  // #swagger.summary = 'Logout user'
  // #swagger.tags = ['authentication']
  // #swagger.description = 'Clears refresh token cookie, deletes refresh token from DB, and removes user session.'
  // #swagger.security = [{ "bearerAuth": []}]
  /* #swagger.parameters['cookie'] = {
      in: 'cookie',
      name: 'refreshToken',
      required: true,
      type: 'string',
      description: 'Refresh token stored in HTTP-only cookie'
   } */
  /* #swagger.responses[200] = {
      description: 'User logged out successfully',
      schema: { success: true, message: 'logged out' }
  } */

  /* #swagger.responses[400] = {
      description: 'No refresh token found in cookie',
      schema: { success: false, message: 'no refresh token found' }
  } */

  /* #swagger.responses[401] = {
      description: 'User ID not found or no session found in DB',
      schema: { success: false, message: 'user id not found / no session found'}
  } */

  /* #swagger.responses[500] = {
      description: 'Internal server error during logout process',
      schema: { success: false, message: 'Something went wrong during logout', error: 'error message' }
  } */


  try{

      // get the refresh token from browser
      const refreshToken = req.cookies.refreshToken

      // if no refreshToken received from browser
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