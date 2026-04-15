import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import connectMongoDb from "./db/connectMongoDb.js";

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

app.use(express.json()); //to parse req.body as json
app.use(express.urlencoded({extended:true})); //to parse req.body as urlencoded data
app.use(cookieParser()); //to parse cookies from the request



app.use("/api/auth",authRoutes);

app.listen(PORT ,() =>{
    console.log(`Server is running on port ${PORT}`);
    connectMongoDb();
})