const API_BASE = 'http://localhost:3000';

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJqYW1lcyIsImlhdCI6MTc0ODIxMDg2OCwiZXhwIjoxNzQ4MjExMTY4fQ.IDH6Nd0gwmxqSmaoLujy7LUfJ2j8jx_ywt8HOhZupq0"
export async function getUserScores(id){
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

// console.log(await getUserScores(2))


export async function addScore(scoreInfo){
    console.log("info before adding scores : ", scoreInfo)
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