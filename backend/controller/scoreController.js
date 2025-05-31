

import pool from "../model/db.js";

// frequently used functions

// const updateHighScore = async (id, level, score) => {
//      try {
//         const user_id = id

//         const checkHighscoreQuery = "SELECT * FROM leaderboard WHERE user_id = ($1)"
//         const checkHighScoreResult = await pool.query(checkHighscoreQuery, [user_id])

//         if (checkHighScoreResult.rows.length > 0){
//             const updateHighScoreQuery = "UPDATE leaderboard SET highest_score = ($1), highest_level = ($2) WHERE user_id = ($3) RETURNING*";
//             const updateValues = [score, level, user_id]

//             const results = await pool.query(updateHighScoreQuery, updateValues)

//             if (results.rows.length > 0){
//                 return {success: true, message: "New high score set", data : results.rows[0]}
//             }

//             return {success: false, message: "failed to update highest score", data: []}
//         }

//         // in case ther user is playing for first time 
//         const addHighScore = "INSERT INTO leaderboard (user_id, highest_score, highest_level) VALUES ($1, $2, $3) RETURNING*";
//         const insertValues = [user_id, score, level]

//         const addHighScoreResult = await pool.query(addHighScore, insertValues);

//         if (addHighScoreResult.rows.length > 0){
//             return {success: true, message:"New high score set", data : addHighScoreResult.rows[0]}
//         }
        
        
//         return {success: false, message: "High Score was not updated", data: []}
//     } catch (error) {
//         throw error
//     }
    
// }


// api route functions

const addScore = async (req, res) => {
    try {
       
        const user_id = req.user.id
        const score = req.body.score;
        const level = req.body.level;
        const cause = req.body.cause;

        let calculateLevel = Math.min(1 + Math.floor((score - 3) / 20), 10);

        if (calculateLevel !== level) {
            return  res.status(500).json({success: false, message:"Failed to add score"})
        }


        const addScoreQuery = "INSERT INTO scores (user_id, score, level, cause) VALUES ($1, $2, $3, $4) RETURNING*";
        const newScoreValues = [user_id, score, level, cause]

        const addScoreResults = await pool.query(addScoreQuery, newScoreValues);

        if (addScoreResults.rows.length === 0){
            return  res.status(400).json({success: false, message:"Failed to add score"})
        }
           
        // compare against leaderboard score
        const checkHighscoreQuery = "SELECT * FROM leaderboard WHERE user_id = ($1)"
        const checkHighScoreResult = await pool.query(checkHighscoreQuery, [user_id])

        // firstime playing
        if (checkHighScoreResult.rows.length === 0){

            const addHighScore = "INSERT INTO leaderboard (user_id, highest_score, highest_level) VALUES ($1, $2, $3) RETURNING*";
            const insertValues = [user_id, score, level]

            const addHighScoreResult = await pool.query(addHighScore, insertValues);

            if (addHighScoreResult.rows.length > 0){
                return res.status(200).json({success: true, message:"New high score set", data : addHighScoreResult.rows[0]});
            }
        }

       
        if (score > checkHighScoreResult.rows[0].highest_score){

            const updateHighScoreQuery = "UPDATE leaderboard SET highest_score = ($1), highest_level = ($2) WHERE user_id = ($3) RETURNING*";
            const updateValues = [score, level, user_id]

            const results = await pool.query(updateHighScoreQuery, updateValues)

            if (results.rows.length > 0){
                return res.status(200).json({success: true, message: "New high score set", data : results.rows[0]})
            }

            return {success: false, message: "failed to update highest score", data: []}
        }
      

        return res.status(200).json({success: true, message: "added new score", data: addScoreResults.rows[0]});
        
    } catch (error) {
        return res.status(500).json({success: false, message: 'server error', error: error.message})
    }
    
}


const getUserScores = async (req, res) => {
       try {
        const paramId = req.params.userId; // comes from url so its a string
        const userId = req.user.id // decoded from jwt so its a number

        if (String(paramId) === String(userId)){
            const getUserScoresQuery = "SELECT * FROM scores WHERE user_id = ($1)";
            const values = [userId]

            const userScores = await pool.query(getUserScoresQuery, values)

            if ( userScores.rows.length > 0){
                // console.log(userScores.rows)
                return res.status(200).json({success: true, message: "retrived user scores", data: userScores.rows})
            }

            return res.status(404).json({success: false, message: "no users scores found"})
        }

        console.log(paramId,userId)
 

        return res.status(403).json({ success: false, message: "userId mosmatch"});

    } catch (error) {
        return res.status(500).json({success: false, message: 'server error', error: error.message})
    }
    
}

const getUserHighestScore = async (req, res) => {
    try {
        const userId = req.params.userId

        const getHighestScoreQuery = "SELECT MAX(score) FROM scores where user_id = ($1)"
        const results = await pool.query(getHighestScoreQuery, [userId])

        if( results.rows.length > 0 ){

            return res.status(200).json({success: true, message: "retrived user highest score", max: results.rows[0].max})
        }

        return res.status(403).json({sucess: false, messege: "error getting score"})
        
    } catch (error) {
          return res.status(500).json({success: false, message: 'server error', error: error.message})
    }
}

const getLeaderboardData = async (req, res) => {
    
    try {
        // "id": 1,
            //   "user_id": 1,
            //   "highest_score": 35,
            //   "highest_level": 1,
            //   "achieved_at": 
        const getLeaderboardDataQuery = 
            `SELECT
                RANK() OVER (ORDER BY l.highest_score DESC) AS rank,
                l.id as id, l.highest_score as score,
                l.highest_level as level,
                l.achieved_at as date, 
                u.username FROM leaderboard l JOIN users u ON l.user_id = u.id order by l.highest_score DESC`
        const leaderboardData = await pool.query(getLeaderboardDataQuery)

        if (!leaderboardData || leaderboardData.rows.length === 0){
            return res.status(404).json({success: false, message: "no data found "})
        }


        return res.status(200).json({
            success: true,
            message: 'learderboard data',
            data : leaderboardData.rows
        })
        
    } catch (error) {
        res.status(500).json({success: false, message: 'server error', error: error.message})
    }
}


export {
   
    addScore,
    getUserScores,
    getUserHighestScore,
    getLeaderboardData
};