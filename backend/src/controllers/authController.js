const User = require('../models/User');
const jwt = require('jsonwebtoken');
const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'7d'
    });
};
const register = async(req,res)=>{
try{
    const{username,password,role}=req.body;
const userExists = await User.findOne({username});
if(userExists){
    return res.status(400).json({message:"user already exists"});
}
const user=await User.create({username,password,role});
res.status(201).json({
    _id:user._id,
    username:user.username,
    role:user.role,
    token:generateToken(user._id)
});
} catch(error){
    res.status(500).json({message: error.message});
}
};

const login = async(req,res)=>{
    try{
        const{username,password}=req.body;

        const user = await User.findOne({username});
        if(user &&(await user.matchPassword(password))){
            res.json({
                _id:user._id,
                username:user.username,
                role:user.role,
                token:generateToken(user._id)
            });
        } else{
            res.status(401).json({message:'invalid username or password'});
        }
    } catch(error){
        res.status(500).json({message:error.message});
    }
};

const getMe = async(req,res)=>{
    res.json(req.user);
};
module.exports = {register,login,getMe};