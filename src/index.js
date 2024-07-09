// require('dotenv').config({path: './env'});
import dotenv from 'dotenv';
import connectDB from './database/index.js';
import {app} from './app.js'

dotenv.config({
    path: './.env',
})
connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error while connecting: " , error);
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log("MONGODB Db connection failed inside app !!! : " , error)
    throw error;
})

// function connectDB(){};
// connectDB();               Basic and Traditional Approach - not recommdended

/*
BasicApproach ----

import express from 'express'; 
const app = express()

;(async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        app.on("error", (error) => {
            console.log("Error: " , error);
        })

        app.listen(process.env.PORT , () => {
            console.log(`App is listening on port: ${process.env.PORT} `);
        })

    } catch (error) {
        console.log("Error: " , error)
        throw error
    }
})(); 
*/