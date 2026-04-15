import User from "../models/user.model.js";
import {generateTokenAndSetCookie} from "../lib/utils/generateToken.js";
import bcrypt from "bcryptjs";


export const signup = async (req , res) => {
    try {
        const {fullName,username,email,password} = req.body;

        const existusername = await User.findOne({username});
        if(existusername){
            return res.status(400).json({message:"Username is already existed"});
        }

        const existemail = await User.findOne({email});
        if(existemail){
            return res.status(400).json({message:"email is already existed"});
        }
        if(password.length < 6){
            return res.status(400).json({message:"password length must be greater than 6 characters"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName: fullName,
            email,
            username,
            password: hashedPassword
        });

        if(newUser){
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link,
            });   
        }else{
            res.status(400).json({message: "Invalid user data"});
        }

    } catch (error) {
        console.log("Error in signup",error.message);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const login = async (req , res) => {
    try {
        const {username,password} = req.body;

        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({message:"Invalid username or password"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid username or password"});
        }
        generateTokenAndSetCookie(user._id,res);

        res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
                bio: user.bio,
                link: user.link,
            
        });

    } catch (error) {
        console.log("Error in login",error.message);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const logout = async (req , res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({message:"Logout succesfull"});
        
    } catch (error) {
        console.log("Error in logout",error.message);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const getMe = async (req,res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe",error.message);
        return res.status(500).json({message:"Internal server error"});
    }
}