

import {  addScore , getUserHighestScore, logoutUser, refreshUserToken, validateUserToken} from "./api_calls.js";
import { displayLoginModal, login, register , logout} from "./components/login.js";
import { registerUIEvents, gameOverUIEvent } from "./components/modals.js";
const navLoginButton = document.getElementById('nav-login-button')
const navLogoutButton = document.getElementById('nav-logout-button')
const navLeaderBoardButton = document.getElementById('nav-leaderboard-button')
const usernameDisplay = document.getElementById('username-display')
const levelSpan = document.getElementById("level-value");
const board = document.querySelector(".board");

// initial starting values
let level = 1;
let score = 0;
let speed = 300;
let direction = {x:0, y:0};
let lastDirection = {x:0, y:0};
let snakeBody = [
    
    {x:1, y:1}
]

let foodData = {x:0, y:0, element:undefined}

// calling the imported functions from other files
displayLoginModal();
login()
register()
logout()
registerUIEvents()


//DrawSnake()

const drawSnake = () => {
    Array.from(board.children).forEach((tile) => {
        if (tile.classList.contains('snake')){
            tile.remove();
        }
    })
    snakeBody.forEach((segment, i) => {
        let part = document.createElement('div')
        part.classList.add("snake");
        part.style.background = 'cyan'
        part.style.gridColumnStart = segment.x
        part.style.gridRowStart = segment.y
        board.appendChild(part)
    })
}



//CheckCollisions()

const checkCollisions = () => {
    // checking collision with food
    if (snakeBody[0].x === foodData.x && snakeBody[0].y === foodData.y) {
        board.removeChild(foodData.element);
        drawFood();
        extendSnake();
        return;
    }

    // checking for collision with walls (fix: use 1-based grid, 1 to 30)
    if (
        snakeBody[0].x < 1 || snakeBody[0].x > 30 ||
        snakeBody[0].y < 1 || snakeBody[0].y > 30
    ) {
        // alert("Game Over (Wall Collision)");
        const cause = "wall collision"
        let newHighest = false
       

        const scoreData = {"score": score, "level":level, "cause":cause, "highest": score}

        // in case user is loggedin get user data from localstorage
        const storedUser = JSON.parse(localStorage.getItem('user'))

        if (storedUser){
            const userId = storedUser.id

            
            // get highest score           
            getUserHighestScore(userId)
            .then((res) => res)
            .then(data => {
                
                // check if old highest score is greater than current score
                if(parseInt(data.max) > parseInt(scoreData.highest)){
                    // No mantain previous highest score
                    scoreData.highest = data.max
                    newHighest = false
                }else{
                    // yes new highest score
                    newHighest = true
                }

                 // send user score to db
                addUserScore(scoreData)

                // activate game over modal with values
                gameOverUIEvent(scoreData, newHighest)

                // re-initialize the game board
                restartGame();
                
                
            })     

            return;
        }

        // getting the guest user data
        const guestUser = JSON.parse(localStorage.getItem('guest'))

        // check if the guest was registerd
        if(!guestUser){
            // in case the guest was not registered then we create a new guest object
            localStorage.setItem('guest', JSON.stringify({ id: Date.now(), username: 'Guest User' , highScore : scoreData.highest}))
            newHighest = true
        }

        // guest exist so just check and update the highest score
        if (parseInt(guestUser.highScore) < parseInt(scoreData.highest)){

            // yes new score greather than old score 
            // update storage to reflect new high score
            guestUser.highScore = scoreData.highest;
            newHighest = true
        }else{

            // mantain the old high score from storage
            scoreData.highest = guestUser.highScore;
        }
       
        // save the guest data back to localstorage
        localStorage.setItem('guest', JSON.stringify(guestUser))


        // activate game over modal with values
        gameOverUIEvent(scoreData, newHighest)

        // re-initialize the game board
        restartGame();
        return;
    }

    // checking collision with itself
    for (let i = 1; i < snakeBody.length; i++) {
        if (
            snakeBody[i].x === snakeBody[0].x &&
            snakeBody[i].y === snakeBody[0].y
        ) {
            // alert("Game Over (Self Collision)");
             const cause = "self collision"
             const scoreData = {"score": score, "level":level, "cause":cause, "highest": score}
             let newHighest = false;
            // get logged in user data from local storage
            const storedUser = JSON.parse(localStorage.getItem('user'))

            // if user exist
            if (storedUser){
                const userId = storedUser.id
               
               
                 // update score in db           
                getUserHighestScore(userId)
                .then((res) => res)
                .then(data => {

                    // checking if previous highest score is higer
                    if(parseInt(data.max) > parseInt(scoreData.highest)){
                         // No mantain previous highest score
                        scoreData.highest = data.max
                        newHighest = false

                    }else{
                        // yes new highest score
                        newHighest = true
                    }

                    // send user score to db
                    addUserScore(scoreData)
                            // activate game over modal with values
                    gameOverUIEvent(scoreData, newHighest)

                    // re-initialize the game board
                    restartGame();
                   
                })
              
                return
           
            }

                // getting the guest user data
            const guestUser = JSON.parse(localStorage.getItem('guest'))

            // check if the guest was registerd
            if(!guestUser){
                // in case the guest was not registered then we create a new guest object
                localStorage.setItem( 'guest', JSON.stringify({ id: Date.now(), username: 'Guest User' , highScore : scoreData.highest}))
                newHighest = true
            }

            // guest exist so just check and update the highest score 
            if (parseInt(guestUser.highScore) < parseInt(scoreData.highest)){
                
                // new score greather than saved score  means new high score has been set
                // set update saved score to reflect new score
                guestUser.highScore = scoreData.highest;
                newHighest = true
            }else{

                // the old score is still higher
                scoreData.highest = guestUser.highScore;
            }
        
            // save the guest data back to localstorage
            localStorage.setItem('guest', JSON.stringify(guestUser))


            // activate game over modal with values
            gameOverUIEvent(scoreData, newHighest)

            // re-initialize the game board
            restartGame();
            return;
        }
    }
};

//Update()
/**
 * updates the snake body when it eats food
 */
const update = () => {
    let dir = getDirection();
    for (let i = snakeBody.length - 2 ; i>=0; i--){
        snakeBody[i+1] = {...snakeBody[i]}
    }

    snakeBody[0].x += dir.x;
    snakeBody[0].y += dir.y;
}

//RestartGame()
/**
 * restarts the game
 * initializes all to zero and snake length to 1
 */
const restartGame = () => {
    snakeBody = [{x:1, y:1}]
    direction = {x:0, y:0}
    updateScore();
    level = 0
    levelSpan.textContent = 0;
}

//DrawFood()
/**
 * draw the snake food randomly on the grid
 */
const drawFood = () => {
    let randX = Math.floor(Math.random() * 30);
    let randY = Math.floor(Math.random() * 30);

    // creating the div element 
    let food = document.createElement('div')
    food.classList.add("food");
    food.style.gridColumnStart = randX == 0 ? 1 : randX;
    food.style.gridRowStart = randY == 0 ? 1 : randY;

    foodData = {x:randX == 0 ? 1: randX, y:randY == 0 ? 1:randY, element:food }

    // adding the dive element to the grid
    board.appendChild(food);
}


//ExtendSnake()
/**
 * Increase the snake length
 */
const extendSnake = () => {
    
    let lastSegment = snakeBody[snakeBody.length - 1];
    let coords = {
        x: lastSegment.x + direction.x,
        y: lastSegment.y + direction.y
    };
    snakeBody.push(coords);

    // modify score
    updateScore();
    // check level
    // level = Math.min(1 + Math.floor((snake.length - 3) / 20), 10);

    
    
}   

/**
 * update the score by counting the snake length
 */
const updateScore = () => {
    score = snakeBody.length - 1;
    let scoreDive = document.getElementById("score-value");

    // check and update the level
    level = Math.min(1 + Math.floor((snakeBody.length - 3) / 20), 10);

    if (scoreDive){
        scoreDive.textContent = score;
    }
    
}


//ChangeDirection()
/**
 * 
 * changing the directions using arrow keys
 */
const changeDirection = (event) => {
    let key = event.key
    switch(key){
        case "ArrowUp":
            if (lastDirection.y !== 0) break
            direction = {x:0, y:-1};
            break;
        case "ArrowDown":
            if (lastDirection.y !== 0) break
            direction = {x:0, y:1};
            break;
        case "ArrowRight":
            if (lastDirection.x !== 0) break
            direction = {x:1, y:0};
            break;
        case "ArrowLeft":
            if (lastDirection.x !== 0) break
            direction = {x:-1, y:0}
            break;

        default:
            break;

    }
}
// key press listiner
window.addEventListener("keydown", changeDirection)


//GetDirection() for the snake
const getDirection = () => {
    lastDirection = direction;
    return direction
}

drawFood();
updateScore();

// game loop

setInterval(()=>{
    //DrawSnake()
    drawSnake();
    //CheckCollisions()
    checkCollisions();
    //Update()
    update();

}, speed)

const addUserScore = async (scoreInfo) => {
    try {
        const response = await addScore(scoreInfo);
        if ( !response.ok){
            return null
        }

        return response

    } catch (error) {
        alert(error.message)
    }
}

// checking user status when page reloads
document.addEventListener('DOMContentLoaded', async () => {
   
            
    
    try {
        // get registered user's data from localscorage
        const storedUser = JSON.parse(localStorage.getItem('user'));
  
        // check if the user data is present
        if (storedUser && storedUser.loggedIn) {

            let token = storedUser.token

            // request to validate the token to ensure user is logged in
            const validateToken = await validateUserToken(token)

            if (validateToken.success){

                // update token in local storage
                storedUser.token = validateToken.token
                localStorage.setItem('user', JSON.stringify(storedUser))
                
                // console.log("token refreshed")

                // display user name
                usernameDisplay.textContent = capitalize(storedUser.username);

                // update ui in case user is logged in
                navLoginButton.classList.add('hidden')
                navLogoutButton.classList.remove('hidden')
                navLeaderBoardButton.classList.remove('hidden')

                return
            }

            localStorage.removeItem('user')
            // update ui 
            navLoginButton.classList.remove('hidden')
            navLogoutButton.classList.add('hidden')
            navLeaderBoardButton.classList.add('hidden')

            logoutUser(storedUser.token)
            throw Error("Refresh token failed")
            
                   
        }
    }catch (error) {
        // console.error("Failed to parse user from localstorage: ", "here ", error) 
        
        // getting guest users information
        let guestUser = JSON.parse(localStorage.getItem('guest'));

        // in case there is no guest user found
        if (!guestUser){

            // initialize new guest info
            const guestInfo = {
                id: 'guest_'+ Date.now(),
                username : 'Guest User',
                highScore: 0
            }

            //creating new guest user
            localStorage.setItem('guest', JSON.stringify(guestInfo))


            return
        }

        // show the username on the game screen
        usernameDisplay.textContent = guestUser.username;

    }
})

 // a function to make the first letter of a string to be in caps and the rest in lowercase
function capitalize(str){
    if (!str) return;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    
}