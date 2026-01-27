import express, { urlencoded } from "express";
import connectDB from './src/config/mongo.config.js';
import shortUrl from './src/routes/shortUrl.route.js';
import userRoutes from './src/routes/user.route.js'
import authRoutes from './src/routes/auth.route.js';
import dotenv from 'dotenv';
import { redirectFromShortUrl } from "./src/controllers/shortUrl.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";
import cors from "cors";
import { attachUser } from "./src/utils/attachUser.js";
import cookieParser from "cookie-parser";

dotenv.config('./.env');
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json());
app.use(urlencoded({extended: true}));
app.use(cookieParser());
app.use(attachUser);

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/create", shortUrl);
app.get("/:id", redirectFromShortUrl);

app.use(errorHandler);

app.listen(process.env.PORT, async () => {
    await connectDB();
    console.log(`Server is running on ${process.env.APP_URL}`);
});