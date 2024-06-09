import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser);

export {app};

/*
we use app.use() for middlewares

app.use(express.json())           -> for storing form data
app.use(express.urlencoded())     -> for storing & accesing url data 
app.use(express.static())         -> for storing puclic files like images or icons
app.use(cookieParser)             -> for storing cookies and accesing them
*/