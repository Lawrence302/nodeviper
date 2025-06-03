

import pool from "../model/db.js";


/**
 * Add a new user score or update high score
 * 
 */
const addScore = async (req, res) => {
    // #swagger.summary = " add new user score"
    // #swagger.tags = ['Score']
    // #swagger.description = "add new user score when the game ends , calculate the and confirm the level , check if its a new high score and update accordingly"
    // #swagger.security = [{"bearerAuth": [] }]
    /* #swagger.parameters['body'] = {
        in : 'body',
        required : 'true',
        schema : {
            "score": 9,
            "level": 1,
            "cause": "self collition || wall collution"
        }
        
    } */
   /* #swagger.responses[200] = {
        description: "Returns either a new score or a new high score. The message field will indicate the case.",
        schema: {
                success: true,
                message: "added new score",
                data: {
                    id: 37,
                    user_id: 2,
                    score: 3,
                    level: 1,
                    created_at: "2025-06-03T21:42:19.655Z",
                    cause: "self collision",
                    incase_of_hig_score : {
                        success: true,
                        "message": "New high score set",
                        "data": {
                            "id": 2,
                            "user_id": 2,
                            "highest_score": 9,
                            "highest_level": 1,
                            "achieved_at": "2025-05-25T20:00:53.996Z"
                        }
                    }
                }
            }
    } */

    /* #swagger.responses[401] = {
        description : " if user token is expired ",
        schema : { "success": false, "message": "Token expired" }
    } */
   /* #swagger.responses[400] = {
        description : "Failed to add score due to level miss match (level received different from level calculated in backend)",
        schema : {success: false, message:"Failed to add score due to level missmatch"}
   } */
   /* #swagger.responses[500] = {
        description : "Failed due to some form of server error",
        schema: {success: false, message: 'server error', error: 'error.message'}
   } */



    try {
       
        const user_id = req.user.id
        const score = req.body.score;
        const level = req.body.level;
        const cause = req.body.cause;

        let calculateLevel = Math.min(1 + Math.floor((score - 3) / 20), 10);

        if (calculateLevel !== level) {
            return  res.status(400).json({success: false, message:"Failed to add score due to level missmatch"})
        }


        const addScoreQuery = "INSERT INTO scores (user_id, score, level, cause) VALUES ($1, $2, $3, $4) RETURNING*";
        const newScoreValues = [user_id, score, level, cause]

        const addScoreResults = await pool.query(addScoreQuery, newScoreValues);

        if (addScoreResults.rows.length === 0){
            return  res.status(500).json({success: false, message:"Failed to add score"})
        }
           
        // compare against leaderboard score
        const checkHighscoreQuery = "SELECT * FROM leaderboard WHERE user_id = ($1)"
        const checkHighScoreResult = await pool.query(checkHighscoreQuery, [user_id])

        // in case its the users firstime playing the intial score should be the highs score
        if (checkHighScoreResult.rows.length === 0){

            const addHighScore = "INSERT INTO leaderboard (user_id, highest_score, highest_level) VALUES ($1, $2, $3) RETURNING*";
            const insertValues = [user_id, score, level]

            const addHighScoreResult = await pool.query(addHighScore, insertValues);

            if (addHighScoreResult.rows.length > 0){
                return res.status(200).json({success: true, message:"New high score set", data : addHighScoreResult.rows[0]});
            }
        }

       // if its not the first time then check current score vs highest score
       // if the current score is greater than highest score
        if (score > checkHighScoreResult.rows[0].highest_score){

            const updateHighScoreQuery = "UPDATE leaderboard SET highest_score = ($1), highest_level = ($2) WHERE user_id = ($3) RETURNING*";
            const updateValues = [score, level, user_id]

            // add new highest score to db
            const results = await pool.query(updateHighScoreQuery, updateValues)

            if (results.rows.length > 0){
                return res.status(200).json({success: true, message: "New high score set", data : results.rows[0]})
            }

            return res.status(500).json({success: false, message: "failed to update highest score", data: []})
        }
      

        return res.status(200).json({success: true, message: "added new score", data: addScoreResults.rows[0]});
        
    } catch (error) {
        return res.status(500).json({success: false, message: 'server error', error: error.message})
    }
    
}

/**
 * Get a specific user's score by id
 * 
 */
const getUserScores = async (req, res) => {
    // #swagger.summary = 'Get scores for a specific user'
    // #swagger.description = 'Retrieves all scores for a user if the JWT token matches the userId in the request parameter.'
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.tags = ['Score']

    /* #swagger.parameters['userId'] = {
        in: 'path',
        required: true,
        description: 'The ID of the user whose scores are being requested',
        type: 'integer',
        example: 2
    } */

    /* #swagger.responses[200] = {
        description: "Successfully retrieved scores for the user",
        schema: {
            success: true,
            message: "retrieved user scores",
            data: [
                {
                    id: 1,
                    user_id: 2,
                    score: 12,
                    level: 2,
                    created_at: "2025-06-04T12:00:00.000Z",
                    cause: "wall collision"
                },
                {
                    id: 2,
                    user_id: 2,
                    score: 8,
                    level: 1,
                    created_at: "2025-06-03T18:30:00.000Z",
                    cause: "self collision"
                }
            ]
        }
    } */

    /* #swagger.responses[403] = {
        description: "User ID in the token does not match the ID in the URL",
        schema: {
            success: false,
            message: "userId mismatch"
        }
    } */

    /* #swagger.responses[404] = {
        description: "No scores found for this user",
        schema: {
            success: false,
            message: "no users scores found"
        }
    } */

    /* #swagger.responses[500] = {
        description: "Internal server error",
        schema: {
            success: false,
            message: "server error",
            error: "error.message"
        }
    } */

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

/**
 * Get users highest score.
 * 
 */
const getUserHighestScore = async (req, res) => {
    // #swagger.summary = "Get user's highest score"
    // #swagger.description = "Retrieves the highest score for a specified user."
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.tags = ['Score']

    /* #swagger.parameters['userId'] = {
        in: 'path',
        required: true,
        description: 'The ID of the user whose highest score is being requested',
        type: 'integer',
        example: 2
    } */

    /* #swagger.responses[200] = {
        description: "Successfully retrieved the highest score for the user",
        schema: {
            success: true,
            message: "retrieved user highest score",
            max: 42
        }
    } */

    /* #swagger.responses[403] = {
        description: "Error getting highest score for the user",
        schema: {
            success: false,
            message: "error getting score"
        }
    } */

    /* #swagger.responses[500] = {
        description: "Internal server error",
        schema: {
            success: false,
            message: "server error",
            error: "error.message"
        }
    } */

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


/**
 * Get leaderboard data ranked by highest score.
 * 
 */
const getLeaderboardData = async (req, res) => {
    // #swagger.summary = "Get leaderboard data"
    // #swagger.description = "Retrieves the leaderboard with users ranked by their highest score in descending order."
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.tags = ['Leaderboard']

    /* #swagger.responses[200] = {
        description: "Successfully retrieved leaderboard data",
        schema: {
            success: true,
            message: "leaderboard data",
            data: [
                {
                    rank: 1,
                    id: 5,
                    score: 99,
                    level: 10,
                    date: "2025-06-03T20:00:00.000Z",
                    username: "playerOne"
                },
                {
                    rank: 2,
                    id: 3,
                    score: 85,
                    level: 9,
                    date: "2025-06-01T18:00:00.000Z",
                    username: "playerTwo"
                }
            ]
        }
    } */

    /* #swagger.responses[404] = {
        description: "No leaderboard data found",
        schema: {
            success: false,
            message: "no data found"
        }
    } */

    /* #swagger.responses[500] = {
        description: "Internal server error",
        schema: {
            success: false,
            message: "server error",
            error: "error.message"
        }
    } */

    try {
    
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