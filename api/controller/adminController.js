const User = require('../models/user.models')

// Get many users
const getUsers = async(req, res) => {
    const users = await User.find({ })
    if(users) {
        return res.status(200).json({count: users.length, users })
    } else {
        return res.status(404).json('Cannot get any users.')
    }
}
// Get a user
const getUser = async(req, res) => {
    const user = await User.findById(req.params.id).select('-password')
    if(user) {
        return res.status(200).json(user)
    } else {
        res.status(404).json('User not found.')
    }
}
// Update user
const updateUser = async(req, res) => {
    const user = await User.findById(req.params.id)
    if(user) {
        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.isAdmin = req.body.isAdmin === undefined ? user.isAdmin : req.body.isAdmin
        const updateUser = await user.save()
        res.status(200).json({
            _id: updateUser._id,
            name: updateUser.name,
            email: updateUser.email,
            avatar: updateUser.avatar,
            isAdmin: updateUser.isAdmin
        })
    } else {
        res.status(404).json('User not found.')
    }
}
// Delete user
const deleteUser = async(req, res) => {
    const user = await User.findById(req.params.id)
    if(user) {
        await user.remove()
        res.status(200).json('Delete successfully.')
    } else {
        return res.status(404).json('User not found.')

    }
}
// Product 

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser
}