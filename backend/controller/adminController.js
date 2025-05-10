
const getUsers = (req, res) => {
  res.status(200).json({ message: 'Here is the list of users' });
};



export {getUsers};