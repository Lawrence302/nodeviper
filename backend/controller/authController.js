import jwt from 'jsonwebtoken';
import pool from "../model/db.js";
import bcrypt from 'bcrypt';

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
        return res.status(401).json({message: "incorrect password"})
      }

      const username = checkUserResults.rows[0].username
      const id = checkUserResults.rows[0].id
      
     /// generate token
     const tokenGeneration = await generateJwtToken(id, username);

      if(tokenGeneration.success){

        const user = checkUserResults.rows[0]
        


        return res.status(200).json(
          { 
            success: true,
            message: 'user loggedin',
            data: {id, username},
            token: tokenGeneration.token ,
            expiresAt: tokenGeneration.expiresAt 
          }
        );
        
      }



      return res.status(401).json({success: false, message: "login failed", data: []})
    }

    return res.status(404).json({ success: false, message: 'user not found please register first'});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
  
};


// validate token from frontend
const validateToken = async (req, res) => {
  try{

    return res.status(200).json({
        success: true,
        message: "Token is valid",
        user: {id: req.user.id, username: req.user.username},
    })

  }catch(error){
     return res.status(500).json({
      success: false,
      message: "Something went wrong during token validation",
      error: error.message,
    });
  }
}

// loggout route

const logout = async (req, res) => {
    try{

      // get user id from token in middlewere
      const userId = req.user.id

      // check if userId is not available
      if (!userId){
        return res.status(401).json({
          sucess: false,
          message: "user id not found"
        })
      }


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
  validateToken,
  logout,
};