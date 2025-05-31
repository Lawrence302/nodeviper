

// getting the global elements present in the index.html UI
const aboutButton = document.getElementById('about')
const modals = document.getElementById('modals')
const navLeaderBoardButton = document.getElementById('nav-leaderboard-button')
import { getLeaderboardData } from "../api_calls.js"

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
        .then((res) => res.text()) // convert the response into text
        .then(html => {
            // add leaderboard html content to modal
            modals.innerHTML = html;

            // get the leaderboard modal now that it is present
            const leaderboardModal = document.getElementById('leaderboard-modal')

            // if the modal does not exist, end the execution
            if(!leaderboardModal) return ;


            // select the table on the modal
            const tableBody = document.getElementById('dash-board-list');
            // if table is not found end execution
            if (!tableBody) return;

            // Clear existing rows (if any)
            tableBody.innerHTML = '';

            /**
             * This function gets the lederboard data from the api call
             */
            getLeaderboardData()
            .then((res)=> {
               
                const leaderboardData = res.data.data

                
                // Check if leaderboardData is empty or not loaded
                if (!leaderboardData || leaderboardData.length === 0) {
                    const emptyRow = document.createElement('tr');
                    emptyRow.innerHTML = `
                        <td colspan="3" class="text-center text-gray-500 py-4">
                        No leaderboard data available.
                        </td>
                    `;

                    // add the message to the table body
                    tableBody.appendChild(emptyRow);
                return;
                }

                // Add each player as a table row
                leaderboardData.forEach(player => {
                    // create a row for each player
                    
                    const row = document.createElement('tr');
                    row.className = 'even:bg-gray-50 hover:bg-green-50';

                    // assigne the values gotten from backend to respective column
                    row.innerHTML = `
                        <td class="px-4 py-2 border-b">${player.rank}</td>
                        <td class="px-4 py-2 border-b">${player.username}</td>
                        <td class="px-4 py-2 border-b">${player.score}</td>
                        <td class="px-4 py-2 border-b">${player.level}</td>
                        
                        <td class="px-4 py-2 border-b">${player.date.split("T")[0]}</td>
                    `;

                    // add the generated row to the table body
                    tableBody.appendChild(row);
                });

            // in case of error , show no leader data available
            }).catch((err)=>{
                
                // Clear existing rows (if any)
                tableBody.innerHTML = '';

                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `
                    <td colspan="3" class="text-center text-gray-500 py-4">
                    No leaderboard data available.
                    </td>
                `;
                tableBody.appendChild(emptyRow);
            })

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
