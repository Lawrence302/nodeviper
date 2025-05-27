
const API_BASE = 'http://localhost:3000';


export async function getUserScores(id){

    const storedUser = JSON.parse(localStorage.getItem('user'))
    if(!storedUser) return;

    const token = storedUser.token

    try {
        const res = await fetch(`${API_BASE}/score/${id}`,{
            method: 'GET',
            headers:{
                'content-type':'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        console.log("done here", res)
        const data = await res.json()
        return {
            status : res.status,
            ok : res.ok,
            ...data
        }
       
    } catch (error) {
       
        return {
            sucess: false,
            message: error.message,
            error: true
        }
    }
    
}

// get users hightes score
export async function getUserHighestScore(id){

    const storedUser = JSON.parse(localStorage.getItem('user'))

    if(!storedUser) return;

    const token = storedUser.token

    try {
        const res = await fetch(`${API_BASE}/score/highest/${id}`,{
            method: 'GET',
            headers:{
                'content-type':'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        // console.log("done here", res)

        // the data is a single value object {"max": value}
        const data = await res.json()
        return {
            status : res.status,
            ok : res.ok,
            ...data
        }
       
    } catch (error) {
       
        return {
            sucess: false,
            message: error.message,
            error: true
        }
    }
}

// console.log(await getUserScores(2))


export async function addScore(scoreInfo){
    console.log("info before adding scores : ", scoreInfo)

    const storedUser = JSON.parse(localStorage.getItem('user'))
    if(!storedUser) return;

    console.log(storedUser.token , "good")
    const token = storedUser.token

    console.log("got here to add scores: ", token)
    try {
        const res = await fetch(`${API_BASE}/score/add`,{
            method: 'POST',
            headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(scoreInfo)
           
        })

        const data = await res.json();
        return {
            status: data.status,
            ok : res.ok,
            ...data

        }
        
    } catch (error) {
        return {
            sucess: false,
            message : error.message,
            error: true
        }
    }
}

// console.log(await addScore({"score": 7, "level":1}))

// register user
export async function registerUser(userData){
    try{

    
        const res = await fetch(`${API_BASE}/register`,{
            method: 'POST',
            headers:{
            'Content-Type': 'application/json',
            
            },
            body: JSON.stringify(userData)
        });

        const data = await res.json()
        console.log("user registration ", data)
        return {
            status: res.status,
            ok: res.ok,
            ...data
        }
    }catch (error){
        return {
            sucess: false,
            message: error.message,
            error : true 
        }
    }
}

// login user
export async function loginUser(userData){
    try{
        const res = await fetch(`${API_BASE}/login`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })

        const data = await res.json()
       
       
        return {
            status: res.status,
            ok : res.ok,
            ...data
        }

    }catch(error){
        return {
            success: false,
            message: error.message,
            error: true
        }
    }
}


export async function logoutUser(token){
    try{

    
        const res = await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok){
            return {
                success: false,
                ok: false
            }
        }


        return {
            sucess: true,
            status: res.status,
            ok : res.ok
        }
    }catch(error){
        return {
            success: false,
            message: error.message,
            error: true
        }
    }
}

// console.log(await loginUser({email:"mat@gmail.com", password:"mat123"}))
// console.log(await registerUser({username: "mary", email:"mary@gmail.com", password: 'mary123', confirmPassword: 'mary123'}))
// console.log(await registerUser({username: "james", email:"james@gmail.com", password: 'james123', confirmPassword: 'james123'}))
// console.log(await registerUser({username: "sam", email:"sam@gmail.com", password: 'sam123', confirmPassword: 'sam123'}))
