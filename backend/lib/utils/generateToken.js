import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateTokenAndSetCookie = (userId,res) => {
    const token = jwt.sign({id: userId},process.env.JWT_SECRET,{
        expiresIn: "15d"
    });

    res.cookie("jwt",token,{
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        httpOnly: true,
        secure: process.env.NODE_ENV !== "production",
        sameSite: "strict"
    })
}