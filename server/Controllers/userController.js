const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const fs = require('fs');
const path = require('path'); 
const fsPromises = require('fs').promises;


const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;
    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};


const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Chưa được xác thực!' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;  
        next();  
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ!' });
    }
};


const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await userModel.findOne({ email });
        if (user) return res.status(400).json("Người dùng đã tồn tại.");

        if (!name || !email || !password) return res.status(400).json("Vui lòng nhập đầy đủ thông tin.");
        if (!validator.isEmail(email)) return res.status(400).json("Email không hợp lệ.");
        if (!validator.isStrongPassword(password)) return res.status(400).json("Mật khẩu không đủ mạnh.");
        if (name.length < 3) return res.status(400).json("Tên người dùng quá ngắn.");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name, email, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
};


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json('Người dùng không tồn tại.');

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(400).json('Kiểm tra lại email hoặc mật khẩu.');

        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name: user.name, email, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
};


const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json('Người dùng không tồn tại.');

        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
};


const updateUser = async (req, res) => {
    const userId = req.user._id; 
    const { name, birthDate, gender } = req.body; 
    const newAvatar = req.file ? req.file : null; 

    try {
        
        const user = await userModel.findById(userId); 
        if (!user) return res.status(404).json('Người dùng không tồn tại.');

        
        const userDir = path.join(__dirname, '../uploads/Avatars', userId.toString());
        
        
        await fsPromises.mkdir(userDir, { recursive: true }); 

        
        let avatarPath = null;
        if (newAvatar) {
            avatarPath = path.join(userDir, 'avatar.png'); 
            await fsPromises.rename(newAvatar.path, avatarPath); 
        }

        
        const updateFields = {};
        if (name) updateFields.name = name; 
        if (birthDate) updateFields.birthDate = birthDate; 
        if (gender) updateFields.gender = gender; 

        
        if (avatarPath) {
            updateFields.avatar = `uploads/Avatars/${userId}/avatar.png`; 
        }

        
        const updatedUser = await userModel.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true }); 

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật thông tin.", error: error.message });
    }
};


const getUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUser, getUsers, authMiddleware };
