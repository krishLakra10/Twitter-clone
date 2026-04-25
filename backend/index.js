import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";

import connectMongoDb from "./db/connectMongoDb.js";

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use(express.json()); //to parse req.body as json
app.use(express.urlencoded({extended:true})); //to parse req.body as urlencoded data
app.use(cookieParser()); //to parse cookies from the request



app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/posts",postRoutes);

app.listen(PORT ,() =>{
    console.log(`Server is running on port ${PORT}`);
    connectMongoDb();
})