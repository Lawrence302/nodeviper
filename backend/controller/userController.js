
const registerController = (req, res) => {
    return res.status(200).json({message:"user registered"});
}

export {registerController}