import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";

export const getUserProfile = async (req,res) => {
    const {username} = req.params;
    try {
        
        const user =  await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).json({meassage:"User not found"});
        }
        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile controller : " , error.message);
        return res.status(500).json({message:"Internal server error"});
    }  
}

export const followUnfollowUser = async (req,res) => {
    
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id).select("-password");
        const currentUser = await User.findById(req.user._id).select("-password");
        if(!userToModify ){
            return res.status(404).json({error:"User to modify not found"});
        }
        if(!currentUser){
            return res.status(404).json({error:"Current user not found"});
        }
        if(id === req.user._id.toString()){
            return res.status(400).json({error:"you can not follow/unfollow yourself"})
        }
        const isFollowing = currentUser.following.includes(id);
        if(isFollowing){
            //unfollow the user
            await User.findByIdAndUpdate(id,{$pull : {followers : req.user._id},});
            await User.findByIdAndUpdate(req.user._id,{$pull : {following : id},});
            res.status(200).json({message:"User unfollowed succesfully"}); 
        }else {
            // follow the user
            await User.findByIdAndUpdate(id,{$push : {followers : req.user._id},});
            await User.findByIdAndUpdate(req.user._id,{$push : {following : id},});
            //send notification to do
            const newNotification = new Notification({
                from: req.user._id,
                to: id,
                type: "follow"
            })
            newNotification.save();
            res.status(200).json({message:"User followed succesfully"});
        }
    } catch (error) {
        console.log("Error in followUnfollowUser controller : " , error.message);
        return res.status(500).json({message:"Internal server error"});
    }
}

export const getSuggestedUser = async (req,res) => {
    try {
        const userId = req.user._id;
        const usersFollowedByMe = await User.findById(userId).select("following")

        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne:userId}
                }
            },
            {sample: {size:10}}
        ]);
        const filteredUsers = users.filter((user)=> !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0,4);
        
        suggestedUsers.forEach((user) => {
            user.password = null;
        });
        
        res.status(200).json(suggestedUsers);
    } catch (error) {
         console.log("Error in getSuggestedUser controller : " , error.message);
        return res.status(500).json({message:"Internal server error"});
    }
}

export const updateUser = async (req,res) => {
    const userId = req.user._id;
    const {username,fullName,currentPassword,newPassword,email,bio,link} = req.body;
    let {profileImg,coverImg} = req.body;

    try {
            const user = await User.findById(userId);
            if(!user){
                return res.status(404).json({error:"user not found"});
            }

            if((!newPassword && currentPassword) || (newPassword && !currentPassword)){
                return res.status(400).json({error:"Both current ans new password are required"});
            }
            if(currentPassword && newPassword){
                const isMatch = await bcrypt.compare(currentPassword,user.password);
                if(!isMatch){
                    return res.status(400).json({error:"current password is incorrect"});
                }
                if(newPassword.length<6){
                    return res.status(400).json({error:"new password must be atcleast 6 characters"});
                }
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(newPassword,salt);
            }

            if(profileImg){
                if(user.profileImg){
                    await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
                }
                const uploadResult = await cloudinary.uploader.upload(profileImg);
                profileImg = uploadResult.secure_url;
            }
            if(coverImg){
                if(user.coverImg){
                    await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
                }
                const uploadResult = await cloudinary.uploader.upload(coverImg);
                coverImg = uploadResult.secure_url;
            }
            user.username= username || user.username;
            user.fullName = fullName || user.fullName;
            user.email = email || user.email;
            user.bio = bio || user.bio;
            user.link = link || user.link;
            user.profileImg = profileImg || user.profileImg;
            user.coverImg = coverImg || user.coverImg;
            await user.save();

            user.password = null;

            return res.status(200).json(user);
        
    } catch (error) {
        console.log("Error in updateUser controller : " , error.message);
        return res.status(500).json({message:"Internal server error"});
    }
}