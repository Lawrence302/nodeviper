
import pool from "../model/db.js";

const getUsers = async (req, res) => {
  // #swagger.summary = " get list of all users"
  // #swagger.tags = ['admin']

  try {
    const usersQuery = "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC";
    const usersResult = await pool.query(usersQuery);
    return res.status(200).json({ success: true, data: usersResult.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  // #swagger.summary = " Delete a user "
  // #swagger.tags = ['admin']
 

  try {
    const userId = req.params.userId;
    const deleteQuery = "DELETE FROM users WHERE id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully', data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

const resetLeaderboard = async (req, res) => {
  try {
    const resetQuery = "TRUNCATE TABLE leaderboard RESTART IDENTITY CASCADE";
    await pool.query(resetQuery);

    return res.status(200).json({ success: true, message: 'Leaderboard reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};


export {getUsers, deleteUser, resetLeaderboard};