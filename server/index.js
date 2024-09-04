const express = require('express')
const app = express()
const mongoose = require('mongoose')
const port = 2000
const db = require('./db');
const routes = require('./routes/routes.js')
const cors = require('cors');
const cookieParser = require('cookie-parser')


app.use(cookieParser()) 
app.use(cors({
  credentials:true,
  origin: 'http://localhost:3000'
}));
app.use(express.json())
app.use('/api',routes)



app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})

