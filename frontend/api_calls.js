
// const API_BASE =  window.location.hostname === 'localhost'
//   ? 'https://localhost:3000'
//   : 'https://nodeviper-backend.onrender.com';

const API_BASE = 'https://nodeviper-backend.onrender.com';
export async function getUserScores(id){

    const storedUser = JSON.parse(localStorage.getItem('user'))
    if(!storedUser) return;

    const token = storedUser.token

    try {

        const validateToken = await validateUserToken(token);

        if (!validateToken.success) throw new Error("Token invalid");
     
        const res = await fetch(`${API_BASE}/score/${id}`,{
            method: 'GET',
            credentials: 'include',
            headers:{
                'content-type':'application/json',
                'Authorization': `Bearer ${validateToken.token}`
            },
            
        })
        
        const data = await res.json()
        return {
            status : res.status,
            ok : res.ok,
            ...data
        }
    
       
    } catch (error) {
       
       throw error
    }
    
}

// get users hightes score
export async function getUserHighestScore(id){

    const storedUser = JSON.parse(localStorage.getItem('user'))

    if(!storedUser) return;

    const token = storedUser.token

    try {

        // validate user token
        const validateToken = await validateUserToken(token)

        // user token is valid
        if (validateToken.success){

        
            const res = await fetch(`${API_BASE}/score/highest/${id}`,{
                method: 'GET',
                credentials: 'include',
                headers:{
                    'content-type':'application/json',
                    'Authorization': `Bearer ${validateToken.token}`
                },
            
            })
            // console.log("done here", res)

            // the data is a single value object {"max": value}
            const data = await res.json()
            return {
                status : res.status,
                ok : res.ok,
                ...data
            }
        }

        throw new Error(" could not vaidate token for highestCore fetch ")
       
    } catch (error) {
       
        throw error
    }
}

// console.log(await getUserScores(2))


export async function addScore(scoreInfo){
    

    const storedUser = JSON.parse(localStorage.getItem('user'))
    if(!storedUser) throw Error(" data not available");

   
    const token = storedUser.token

   
    try {

        const validateToken = await validateUserToken(token)

        if (validateToken.success){

            const res = await fetch(`${API_BASE}/score/add`,{
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${validateToken.token}`
                },
                body: JSON.stringify(scoreInfo),
                
            
            })

            const data = await res.json();
            return {
                status: data.status,
                ok : res.ok,
                ...data

            }
        }

        throw new Error(" failed to validate user token for addScore")

        
    } catch (error) {
        throw error
    }
}

/**
 * gets the leaaderboard data from backend
 * 
 * reads token from localstorage 
 * if the token is not found, then it throws a 'user data not available ' error
 * if the token is found, then it is validated using 'validateUserToken()' function
 * if token is valid, then the fetch leaderboard api route is called
 * the data is gotten and sent to client
 * if th token is not valid, then  an error is thrown
 */
export async function getLeaderboardData(){

    // get user object from localstorage
    const storedUser = JSON.parse(localStorage.getItem('user'))
    // if the user object is not present
    if(!storedUser) throw Error(" user data not available ");

   
    const token = storedUser.token

    try {

        // validate the user token
        const tokenValid = await validateUserToken(token)

        // if the token is valid
        if(tokenValid.success){
            // fetch leaderboard data
            const res = await fetch(`${API_BASE}/score/leaderboard`, {
                headers:{
                    'Content-Type': "application/json",
                    'Authorization': `Bearer ${tokenValid.token}`
                },
                credentials : 'include'
            })

            const dashboardData = await res.json()

            // if there was an error getting back the leaderboard data
            if (!res.ok){
                return {
                    success: false,
                    ok: res.ok,
                    message: dashboardData.message
                }
            }

            // if leader board data is gotten back from api
            return {
                success: true,
                ok : res.ok,
                data : dashboardData
            }
        }

        // in case the token is not valid, throw an error
        throw new Error(" could not validate token for leaderboard fetch")

    } catch (error) {
        // in case of unknow error
        throw error
    }
}

/**
 * registering a new user
 * 
 * receives the users data from frontend ui
 * sends the data to the backend
 * if the response received is not ok, then success false and a message is sent to client
 * if the response is ok , then the users data along with success is sent to client
 * 
 * @param {*} userData 
 * @returns 
 */
export async function registerUser(userData){
    try{

        // calls the register user route
        const res = await fetch(`${API_BASE}/register`,{
            method: 'POST',
            credentials: 'include',
            headers:{
            'Content-Type': 'application/json',
            
            },
            body: JSON.stringify(userData), // sending the users data
            
        });

        // convert the response to json object
        const data = await res.json()

        // in case the response is not okay
        if (!res.ok){
            return {
                status: res.status,
                ok : res.ok,
                message : data.message
            }
        }
       
        // in case of an okay response
        return {
            status: res.status,
            ok: res.ok,
            ...data
        }
    }catch (error){
        // in case of an unknown error
        throw error
    }
}


/**
 * login user function
 * 
 * receives users data 
 * calls a login fetch request to login the user on the server
 * 
 * 
 * @param {*} userData 
 * @returns 
 */
export async function loginUser(userData){
    try{

        // login fetch request 
        const res = await fetch(`${API_BASE}/login`,{
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData), // sending the users data to backend
           
        })

        const data = await res.json()

        // 401 meaning loggin failed
        if (res.status == 401){
           
            return {
                status: res.status,
                ok : res.ok,
                message: data.message
            }
        }

        // 404 meaning the user is not registered
        if (res.status == 404){
          
            return {
                 status: res.status,
                ok : res.ok,
                message: data.message
            }
        }
       
      
       
        return {
            status: res.status,
            ok : res.ok,
            ...data
        }

    }catch(error){

        throw error
    }
}

/**
 * refresh user token
 * sends the refresh token from cookies to server
 * new token is generated and sent back as response
 * 
 */
export async function refreshUserToken(){
    
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
  
        // check if the user data is present
        if (storedUser && storedUser.loggedIn) {

            let token = storedUser.token

            const res = await fetch(`${API_BASE}/refresh-token`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            const data = await res.json()
        

            if (!res.ok){

                localStorage.removeItem('user')

                return {
                    success: false,
                    ok : res.ok,
                    message: data.message
                }
            }

            
            storedUser.token = data.token
            localStorage.setItem('user', JSON.stringify(storedUser))
        

            return {
                success: true,
                message: data.message,
                token : data.token
            }

        }

        return {
            success: false,
            message: "no user found"
        }
        
    } catch (error) {
        
        throw new Error(`Token validation failed: ${err.message}`);

    }
}

/**
 * Validates the user's access token by sending a request to the backend `/validate` route.
 * 
 * - If the token is valid, it returns it as-is.
 * - If the token has expired, it attempts to refresh the token using `refreshUserToken()`.
 * - If refreshing succeeds, it returns the new token.
 * - If refreshing fails or the token is invalid for other reasons, it returns a failure response.
 * 
 * This helps ensure protected routes are accessed only with valid tokens
 */
export async function validateUserToken(token){
    try{

        // sending validate request to backend
        const valResponse = await fetch(`${API_BASE}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            credentials : 'include' // for cookies
        })
        
        const valData = await valResponse.json()

        // if token has expired
        if( !valResponse.ok && valResponse.status === 401 && valData.message === 'Token expired'){

            
                // console.log("user token expired")
               // try refreshing the token
                const newToken = await refreshUserToken()
                // if token refrsh is a success
                if (!newToken.success){
                    return {
                        success: false,
                    }
                }
                // console.log("new token generated.. ")

                // returns sucess respond
                return {
                    success: true,
                    token : newToken.token
                }

            
        }

        // if the token in valid , then use the token
        if (valResponse.ok){
            return {
                success: true,
                token : token
            }
        }

        // in case the validation failed for a different reason
        return {success: false}

    }catch(err){
        // unespected error e.g(network issue)
        throw err
    }
}



/**
 * 
 * Loggs out the user
 * first validates user token using validateUserToken() function
 * this seperates the validation logic from the logout logic
 * if the token is valid, then the valid token is used to peform the loggout operation
 * takes the user token and sends it to the backend
 */
export async function logoutUser(token){
    try{

        // validate user token
        const tokenValid = await validateUserToken(token)

        // if token is valid
        if(tokenValid.success){
        
            // peform loggout operation
            const res = await fetch(`${API_BASE}/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenValid.token}`
                },
                credentials: 'include' // this is neccesary for sending the http cookies to  backend
            })

            // in case logout fails
            if(!res.ok){
                // throw an error
                throw new Error( `loggout failed with status ${res.status}`)
            }

     
            // in case it is sucessfull
            return {
                success: true,
                status: res.status,
                ok : res.ok
            }
        }

        throw new Error(" could not logg user out ")

       
    }catch(error){

        // console.log(" see the type of error : ", error)
        // in case logout failed due to unknow error
        throw error
    }
}

// console.log(await loginUser({email:"mat@gmail.com", password:"mat123"}))
// console.log(await registerUser({username: "mary", email:"mary@gmail.com", password: 'mary123', confirmPassword: 'mary123'}))
// console.log(await registerUser({username: "james", email:"james@gmail.com", password: 'james123', confirmPassword: 'james123'}))
// console.log(await registerUser({username: "sam", email:"sam@gmail.com", password: 'sam123', confirmPassword: 'sam123'}))
