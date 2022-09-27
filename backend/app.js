const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
require('dotenv').config({path:"config/config.env"});
const cors = require('cors')


//useing middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors())



const post = require('./routes/post.js')
const user = require('./routes/user.js')





app.use('/api/v1',post);
app.use('/api/v1', user)


module.exports = app;






