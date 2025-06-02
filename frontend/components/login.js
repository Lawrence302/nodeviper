    
const navLoginButton = document.getElementById('nav-login-button')
const navLogoutButton = document.getElementById('nav-logout-button')
const navLeaderBoardButton = document.getElementById('nav-leaderboard-button')
const loginModal = document.getElementById('login-modal')
const modalLoginButton = document.getElementById('modal-login-button')
const modalRegisterButton = document.getElementById('modal-register-button')
const modalRegisterShowSpan = document.getElementById('modal-register-show-span')
const modalLoginShowSpan = document.getElementById('modal-login-show-span')
const modalRegisterMemberDirectionMessage = document.getElementById('register-modal-member-direction-message')
const modalLoginMemberDirectionMessage = document.getElementById('login-modal-member-direction-message')
const confirmPasswordContainer = document.getElementById('confirm-password-container')
const userEmailInput = document.getElementById('email-text')
const userPasswordInput = document.getElementById('password-text')
const userConfirmedPasswordInput = document.getElementById('confirm-password-text')
const userNameInput = document.getElementById('username-text')
const userNameContainer = document.getElementById('user-name-container')
const loginError = document.getElementById('login-error')
const usernameDispay = document.getElementById('username-display')




import { loginUser, registerUser , logoutUser} from "../api_calls.js"

/** 
 * Handles switching the form to registration mode
 */
modalRegisterShowSpan.addEventListener('click', ()=>{

    // hides the login button and member register message
    modalLoginButton.classList.add('hidden')
    modalRegisterMemberDirectionMessage.classList.add('hidden')
    
    // shows register button and member login message by removing the hidden class
    modalRegisterButton.classList.remove('hidden')

    // shows user login messegae  in case user is already registered
    modalLoginMemberDirectionMessage.classList.remove('hidden')

    // show the confirm password element since its registration
    confirmPasswordContainer.classList.remove('hidden')
    // make the username field visible
    userNameContainer.classList.remove('hidden')

    // clear any error in the login error element if any exist
    loginError.textContent = ''

    // makeing the confirm password field required
    userConfirmedPasswordInput.required = true
    
})

/** 
 * Handles switching the form to login mode
 */
modalLoginShowSpan.addEventListener('click', () => {

    // shows login button 
    modalLoginButton.classList.remove('hidden')

    // show register member hidden message in case user is not registered
    modalRegisterMemberDirectionMessage.classList.remove('hidden')

    // hide registration button
    modalRegisterButton.classList.add('hidden')

   // hide the login message 
    modalLoginMemberDirectionMessage.classList.add('hidden')

    // hide the confirm password container since its not needed for login
    confirmPasswordContainer.classList.add('hidden')

    // hide the user name container 
    userNameContainer.classList.add('hidden')

    // clear any error in the login error element if any exist
    loginError.textContent = ''


    // make the userConfirmPassword input false since its not needed in login
    userConfirmedPasswordInput.required = false
})


/**
 * makes login modal to dissaper when the parent is clicked
 */
loginModal.addEventListener('click', (event)=>{
    if(event.target == loginModal){
        loginModal.classList.add("hidden")
        clearForm()
    }
    
})

/**
 * function to make the login modal visible
 */
export function displayLoginModal(){
     navLoginButton.addEventListener('click', (e) => {
        e.preventDefault()
        loginModal.classList.remove('hidden')
        console.log("login clicked")
    })
}

/**
 * login function that handles the login process
 * receives input and peforms validation
 * peform api call to peform the login action
 */
export function login(){
    modalLoginButton.addEventListener('click', (e)=>{
        e.preventDefault()
        const form = e.target.closest('form')
        if(!form.checkValidity()){
            form.reportValidity()
            return
        }

        // get input values
        const email = userEmailInput.value.trim();
        const password = userPasswordInput.value.trim();

        // vallidate input values
        if (email === '' || password === ''){
            loginError.textContent = "Please Enter valid characters"
            return
        }

        /* handling the user login using .then . this is to avoid using async await which
         will involve making the login function async and will add complexity to the code */ 
       loginUser({email,password})
       .then((response) => {

            // if the login is successful
            if (response.ok){
               // get user information from the response.data object
                const id = response.data.id
                const username = response.data.username
                const token = response.token

                // delete the guest user in case one existed
                localStorage.removeItem('guest')

                // store the user's information into local storage
                localStorage.setItem('user', JSON.stringify({id, loggedIn: true, username, token }))

                // update the ui
                navLoginButton.classList.add('hidden')
                navLeaderBoardButton.classList.remove('hidden')
                navLogoutButton.classList.remove('hidden')
                loginModal.classList.add('hidden')

                // display users name above the board
                usernameDispay.textContent = username

                clearForm()
                return
            }

            // in case of a wrong email or password
            if (response.status == 401){
                loginError.textContent = response.message
                return
            }

            // in case the user is not registered
            if (response.status == 404){
                loginError.textContent = response.message
                return
            }

            
        })
        .catch((error)=>{
            // in case of network error 
            if (error.message == 'Failed to fetch'){
                loginError.textContent = "Login failed. Network error"
                return
            }
            // incase of backend server error
            loginError.textContent = "Login failed. Pleas try again"
        })
       

       

        clearForm()
    })



   
  
}
/**
 * Register function to handle user registration
 * receives input and peforms validation
 * Does api calls to peform the registration action
 */
export function register(){
    
    modalRegisterButton.addEventListener('click', (e)=>{
        e.preventDefault()
        const form = e.target.closest('form');

        if(!form.checkValidity()){
            form.reportValidity();
            return;
        }
        
        const userName = userNameInput.value.trim()
        const email = userEmailInput.value.trim();
        const password = userPasswordInput.value.trim();
        const confirmPassword = userConfirmedPasswordInput.value.trim();

        // user input vallidation
        if (userName === "" || email === '' || password === '' || confirmPassword === ''){
            loginError.textContent = "All fields are required"
            return
        }

        if (password !== confirmPassword){
            loginError.textContent = "Passwords do not match "
            return
        }

        if (password.length <= 4){
            loginError.textContent = "Password should be greater than 4 characters"
            return
        }



        // console.log(" register button clicked", {email, password, confirmPassword})
        /**
         * peforming user registration process
         */
        registerUser({email, password, confirmPassword})
        .then((response) => {

            // if registration is successful
            if (response.ok){
               // getting the user information from the response data object
                const id = response.data.id
                const username = response.data.username
                const token = response.token

                localStorage.removeItem("guest")

                // storing the users information into local storage
                localStorage.setItem('user', JSON.stringify({id, loggedIn: true, username, token }))

                // update the ui
                navLoginButton.classList.add('hidden')
                navLeaderBoardButton.classList.remove('hidden')
                navLogoutButton.classList.remove('hidden')
                loginModal.classList.add('hidden')

                // display the username above the board
                usernameDispay.textContent = username

                clearForm()
                return
            }

            // in case registration fails
            loginError.textContent = response.message

            return
        }).catch((error) => {
            // in case of network error
            if (error.message == 'Failed to fetch'){
                loginError.textContent = "Login failed. Network error"
                return
            }

            // in case of a failure from backend
            loginError.textContent = "Login failed. Pleas try again"
        })

        clearForm()
    })


}

// logout function
export function logout(){
    navLogoutButton.addEventListener('click', () => {
         const storedUser = JSON.parse(localStorage.getItem('user'))

        if(storedUser) {    

            const token = storedUser.token
            logoutUser(token).then((response) => {
                return response
            }).then((data => {
                if (data.ok){
                    console.log('user is logged in')
                    localStorage.removeItem('user')

                    // update ui 
                    navLoginButton.classList.remove('hidden')
                    navLogoutButton.classList.add('hidden')
                    navLeaderBoardButton.classList.add('hidden')
                
                    location.reload()
                }
            })).catch((err)=>{
                console.error("Failed to loggout" , err)
            })
            
            
            
        }
    })
   
}

const clearForm = () => {
    userEmailInput.value = '';
    userPasswordInput.value = '';
    userConfirmedPasswordInput.value = '';
    userNameInput.value= '';
    loginError.textContent = '';
}