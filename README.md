# NodeViper 🐍
**Created by [Ganjer Lawrence](https://github.com/lawrence302)**

NodeViper is a **full-stack game application** that combines a dynamic frontend with a robust Node.js + Express backend. The application allows players to compete by submitting scores, tracking progress, and viewing live leaderboards. It includes secure user authentication using JWT and provides a RESTful API for managing users, scores, and leaderboard data.

The backend handles user registration, login, score submissions, and leaderboard management. The frontend (built with HTML/tailwind css/JavaScript) presents an engaging interface for playing the game and visualizing stats.
## Frontend

The frontend is a simple yet responsive game interface built using **HTML**, **Tailwind CSS**, and **Vanilla JavaScript**. It communicates with the backend API for user authentication, score tracking, and leaderboard updates.

### How to Run Frontend

1. Navigate to the `frontend/` directory (or wherever your HTML files are located).
2. Open `index.html` in your browser directly, **or**
3. Use a local server (e.g., Live Server extension in VS Code) for better development experience.

> ⚠️ **Note:** Ensure that API calls in your frontend JavaScript correctly target the backend base URL (e.g., `http://localhost:3000`).

## Features

- 🎮 Game interface with real-time score tracking
- 🔐 User authentication with JWT
- Secure routes with middleware authentication
- 📊 Leaderboard ranked by highest score
- 🧠 Score history and level logic validation
- 📡 REST API with Swagger documentation
- 💾 PostgreSQL database integration

## Technologies

- Backend: Node.js, Express.js, PostgreSQL
- Frontend: HTML, CSS, JavaScript
- Auth: JWT
- Documentation: Swagger


## Table of Contents

- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Usage](#usage)  
- [API Endpoints](#api-endpoints)  
- [Database Schema](#database-schema)  
- [License](#license)  

---

## Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/yourusername/nodeviper.git
   cd nodeviper

2. Install dependencies:
    ```bash
    npm install

3. Set up your PostgreSQL database and update the .env file with your database credentials.

4. Run database migrations or create the required tables    (see Database Schema).

5. Start the server:
    ```bash
    npm start

## Environment Variables

Create a .env file in the root directory with the following variables:

PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key

## Usage

Use an API client like Postman or curl to interact with the API.

    Register a new user: POST /auth/register

    Login: POST /auth/login

    Add a new score: POST /scores/add (Authenticated)

    Get user scores: GET /scores/:userId (Authenticated)

    Get user highest score: GET /scores/highest/:userId (Authenticated)

    Get leaderboard data: GET /scores/leaderboard

## API Endpoints

### Auth Routes
| Endpoint              | Method | Description                             | Auth Required |
| --------------------- | ------ | --------------------------------------- | ------------- |
| `/auth/register`      | POST   | Register a new user                     | No            |
| `/auth/login`         | POST   | Login and get JWT token                 | No            |
| `/auth/refresh-token` | POST   | Get new access token with refresh token | No            |
| `/auth/validate`      | POST   | Validate access token                   | Yes           |
| `/auth/logout`        | POST   | Logout and revoke tokens                | Yes           |

### Score Routes
| Endpoint                  | Method | Description                                  | Auth Required |
| ------------------------- | ------ | -------------------------------------------- | ------------- |
| `/scores/add`             | POST   | Add new user score and update leaderboard    | Yes           |
| `/scores/:userId`         | GET    | Get all scores for a user                    | Yes           |
| `/scores/highest/:userId` | GET    | Get highest score for a user                 | Yes           |
| `/scores/leaderboard`     | GET    | Get leaderboard data ranked by highest score | Yes           |


# Database Schema

## UsersTable
| Column   | Type    | Description     |
| -------- | ------- | --------------- |
| id       | SERIAL  | Primary key     |
| username | VARCHAR | Unique username |
| email    | VARCHAR | Unique email    |
| password | TEXT    | Hashed password |

## Scores Table
| Column      | Type      | Description                   |
| ----------- | --------- | ----------------------------- |
| id          | SERIAL    | Primary key                   |
| user\_id    | INTEGER   | Foreign key to users(id)      |
| score       | INTEGER   | User score                    |
| level       | INTEGER   | Level calculated from score   |
| cause       | VARCHAR   | Cause of game end (collision) |
| created\_at | TIMESTAMP | Time score was recorded       |

## Leaderboard Table

| Column         | Type      | Description                       |
| -------------- | --------- | --------------------------------- |
| id             | SERIAL    | Primary key                       |
| user\_id       | INTEGER   | Foreign key to users(id)          |
| highest\_score | INTEGER   | User's highest score              |
| highest\_level | INTEGER   | Level achieved with highest score |
| achieved\_at   | TIMESTAMP | Time highest score achieved       |


## License

This project is licensed under the MIT License.

## Contact

Created by [Ganjer Lawrence](https://github.com/lawrence302) - feel free to reach out for questions or contributions!
