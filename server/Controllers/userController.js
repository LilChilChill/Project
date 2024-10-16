const userModel = require('../Models/userModel')
const brcypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY

    return jwt.sign({_id}, jwtkey, {expiresIn: "3d"})
}

const registerUser = async (req, res) => {
    try{
        const {name, email, password} = req.body

        let user = await userModel.findOne({ email })

        if(user) 
            return res.status(400).json("Người dùng đã tồn tại.")
        
        if(!name || !email || !password) 
            return res.status(400).json("Vui lòng nhập đầy đủ thông tin.")

        if(!validator.isEmail(email)) 
            return res.status(400).json("Email không hợp lệ")

        if(!validator.isStrongPassword(password)) 
            return res.status(400).json("Mật khâu không đủ mạnh")
        
        user = new userModel({name, email, password})

        const salt = await brcypt.genSalt(10)
        user.password = await brcypt.hash(password, salt)

        await user.save()

        const token = createToken(user._id)

        res.status(200).json({_id: user._id, name, email, token})
    }catch(error) {
        console.log(error)
        res.status(500).json("Đã xảy ra lỗi", error)
    }

}

const loginUser = async (req, res) => {
    const {email, password} = req.body

    try{
        let user = await userModel.findOne({ email })

        if(!user) return res.status(400).json('Người dùng không tồn tại.')

        const isValidPassword = await brcypt.compare(password, user.password)

        if(!isValidPassword) return res.status(400).json('Kiểm tra lại email hoặc mật khẩu.')

        const token = createToken(user._id)

        res.status(200).json({_id: user._id, name: user.name, email, token})
    }catch(error){
        console.log(error)
        res.status(500).json("Đã xảy ra loi", error)
    }
}

const findUser = async (req, res) => {
    const userId = req.params.userId 
    try{
        const user = await userModel.findById(userId)

        res.status(200).json(user)
    }catch(error){
        console.log(error)
        res.status(500).json("Đã xảy ra loi", error)
    }
}

const getUsers = async (req, res) => {
    
    try{
        const users = await userModel.find()

        res.status(200).json(users)
    }catch(error){
        console.log(error)
        res.status(500).json("Đã xảy ra loi", error)
    }
}

module.exports = {registerUser, loginUser, findUser, getUsers}