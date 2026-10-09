import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"
import { connectMongoDb } from './config/config.js'
import AuthRoutes from './routes/AuthRoute/authRoute.js'

dotenv.config()

const port = process.env.PORT

connectMongoDb()

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(bodyParser.json({ limit: '1gb' }))
app.use(bodyParser.urlencoded({extended: true, limit: '1gb'}))

app.use('/api/auth', AuthRoutes)

app.get('/', () => {
     console.log('api porfolio service is working');
})

app.listen(port, () => {
    console.log(`listening on port: ${port}`);
})