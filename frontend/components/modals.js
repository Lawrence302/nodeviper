
// getting the global elements present in the index.html UI
const aboutButton = document.getElementById('about')
const modals = document.getElementById('modals')
const navLeaderBoardButton = document.getElementById('nav-leaderboard-button')


export function registerUIEvents(){


    /** 
     *  Adds click event to the "About" button to show "aboutModal"
     * On click, it fetches the about.html content, injects it into #modals,
     * and sets up modal open/close behavior.
     * the fetched page is then inserted into the modals div innerHTML
     */
    aboutButton.addEventListener('click', ()=> {

        // fetch request to fetch the page content of about.html file
        fetch('./pages/about.html')
        .then(res => res.text())
        .then(html => { 
            // console.log("gotten page ", html)
            modals.innerHTML= html

            /*
             The reason i am defining and getting the about modal components here is because
             initialy is does not exist in the Dom untill fetched. So attempting to get the element 
             when it is not yet fetched up above globally  will cause an error saying aboutModal is null
            */
            const aboutModal = document.getElementById('about-modal')

            /* this button is also defined here because it only exist inside the about-modal
            attempting to define it outsite will lead to an erro since it can't exist without the modal present */
            const closeAboutModalButton = document.getElementById('close-about-modal')

            // check for component presence
            if (!aboutModal || !closeAboutModalButton) return;


            // event listener to close about modal when background is blicked
            aboutModal.addEventListener('click', (e) => {
                if (e.target == aboutModal){
                    aboutModal.classList.add('hidden')
                }
                
            })

            //close about modal when the close button is clicked
            closeAboutModalButton.addEventListener('click', ()=> {
                aboutModal.classList.add('hidden')
            })
        })
    })



    /**
     * Add click event to nav leaderboard button
     */
    navLeaderBoardButton.addEventListener('click', ()=>{
        
        // fetch the leaderboard.html modal
        fetch('./pages/leaderboard.html')
        .then((res) => res.text())
        .then(html => {
            // add leaderboard html content to modal
            modals.innerHTML = html;

            const leaderboardModal = document.getElementById('leaderboard-modal')

            if(!leaderboardModal) return ;

            // To close the leaderboard when modal is clicked
            leaderboardModal.addEventListener('click', (e)=> {
                if(e.target == leaderboardModal){
                    leaderboardModal.classList.add('hidden')
                }
            })


        })
    })


    

}

/**
     * Game over ui event
     */
export function gameOverUIEvent(gameOverInfo, newHighest){
    fetch('./pages/gameover.html')
    .then((res) => res.text() )
    .then(html => {
        // console.log(html)
        modals.innerHTML = html

       
        const gameOverModal = document.getElementById('game-over-modal')
        const gameOverScore = document.getElementById('game-over-score')
        const gameOverCause = document.getElementById('game-over-cause')
        const gameOverLevel = document.getElementById('game-over-level')
        const highestScore = document.getElementById('game-over-highest')
        const newHighestDislaply = document.getElementById('new-highest-messege-display')
        const gameOverModalCloseButton = document.getElementById('game-over-modal-close-button')

        if(!gameOverCause || !gameOverScore || !gameOverModal) reurn ;

        gameOverCause.textContent = gameOverInfo.cause;
        gameOverScore.textContent =  gameOverInfo.score;
        gameOverLevel.textContent = gameOverInfo.level;
        highestScore.textContent = gameOverInfo.highest;

        if(newHighest){
            newHighestDislaply.innerHTML = 'New High Score Achieved'
        }


        gameOverModal.addEventListener('click', (e) => {
            if(e.target == gameOverModal){
                gameOverModal.classList.add('hidden')
            }
        })

        gameOverModalCloseButton.addEventListener('click', ()=>{
            gameOverModal.classList.add('hidden')
        })


    })
}
