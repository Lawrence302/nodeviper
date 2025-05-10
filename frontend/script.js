
const board = document.querySelector(".board");
let level = 1;
let score = 0;
let speed = 300;
let direction = {x:0, y:0};
let lastDirection = {x:0, y:0};
let snakeBody = [
    
    {x:1, y:1}
]

let foodData = {x:0, y:0, element:undefined}


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
        alert("Game Over (Wall Collision)");
        restartGame();
        return;
    }

    // checking collision with itself
    for (let i = 1; i < snakeBody.length; i++) {
        if (
            snakeBody[i].x === snakeBody[0].x &&
            snakeBody[i].y === snakeBody[0].y
        ) {
            alert("Game Over (Self Collision)");
            restartGame();
            return;
        }
    }
};

//Update()

const update = () => {
    let dir = getDirection();
    for (let i = snakeBody.length - 2 ; i>=0; i--){
        snakeBody[i+1] = {...snakeBody[i]}
    }

    snakeBody[0].x += dir.x;
    snakeBody[0].y += dir.y;
}

//RestartGame()

const restartGame = () => {
    snakeBody = [{x:1, y:1}]
    direction = {x:0, y:0}
    updateScore();
}
//DrawFood()

const drawFood = () => {
    let randX = Math.floor(Math.random() * 30);
    let randY = Math.floor(Math.random() * 30);

    let food = document.createElement('div')
    food.classList.add("food");
    food.style.gridColumnStart = randX == 0 ? 1 : randX;
    food.style.gridRowStart = randY == 0 ? 1 : randY;

    foodData = {x:randX == 0 ? 1: randX, y:randY == 0 ? 1:randY, element:food }
    board.appendChild(food);
}


//ExtendSnake()

const extendSnake = () => {
    // let coords = {
    //     x:snakeBody[snakeBody.length-1].x + Math.abs(direction.x),
    //     y:snakeBody[snakeBody.length-1].y + Math.abs(direction.y)}
    // snakeBody.push(coords);

    
    let lastSegment = snakeBody[snakeBody.length - 1];
    let coords = {
        x: lastSegment.x + direction.x,
        y: lastSegment.y + direction.y
    };
    snakeBody.push(coords);

    
    updateScore();
    // check level
    checkLevel();
    
    
}   

const updateScore = () => {
    score = snakeBody.length - 1;
    let scoreDive = document.getElementById("score-value");
    if (scoreDive){
        scoreDive.textContent = score;
    }
    
}
//ChangeDirection()

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
window.addEventListener("keydown", changeDirection)


//GetDirection()

const getDirection = () => {
    lastDirection = direction;
    return direction
}

// increase level
const checkLevel = () => {
    let levelSpan = document.getElementById("level-value");
    if (score >= 2 && score < 5){
        level = 2;
        speed = 200;
        console.log('welcome to level 2')
        levelSpan.textContent = 2
    }else if (score >= 5){
        level = 3;
        speed = 100;
        console.log('welcome to level 3')
        levelSpan.textContent = 3
    }
    
    console.log(speed)
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

    
  console.log(speed)
}, speed)
