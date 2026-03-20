import dotenv from "dotenv"
dotenv.config()


import express from "express"
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from "url"
import connectDB from "./config/db.js"
import errorHandler from "./middleware/errorHandler.js"


import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import flashcardRoutes from './routes/flashcardRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import quizRoutes from  './routes/quizRoutes.js'
import progressRoutes from  './routes/progressRoutes.js'
//es6
const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)

//Initialize express app

const app = express()

//connect to MongoDb
connectDB()

//middleware to handle CORS

// app.use(
//     cors({
//         origin:"*",
//         methods:["GET","POST","PUT","DELETE"],
//         allowedHeaders:["Content-Type","Authorization"],
//         credentials:true,
//     })
// )
// app.use(
//   cors({
//     origin: ["http://localhost:5173"], // your frontend
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-power-learner-frontend.vercel.app"
    ],
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(express.json())
app.use(express.urlencoded({ extended: true}))

//STATIC folder for upload

app.use('/uploads', express.static(path.join(_dirname,'uploads')))
//Routes

app.use('/api/auth',authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/flashcards',flashcardRoutes)
app.use('/api/ai',aiRoutes)
app.use('/api/quizzes',quizRoutes)
app.use('/api/progress',progressRoutes)
app.use(errorHandler);

//404 handle

app.use((req,res) => {
    res.status(404).json({
        success:false,
        error:'Routes not found',
        statusCodes:404
    })
})


const PORT = process.env.PORT || 8000;
app.listen(PORT,() => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port${PORT}`)
})

process.on('unhandledRejection',(err)=>{
    console.error(`Error:${err.message}`)
    process.exit(1);
})