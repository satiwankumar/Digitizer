const express = require('express')
const app = express()
const port  = process.env.port || 5000
const connectDB = require('./config/db')
var cors = require('cors');
require('dotenv').config()
//db connection
connectDB()
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
  
    next();
  });
  
  app.use(cors())
  app.options('*', cors())
  app.use(express.json({limit: '50mb'}))
  
  //Init middleware
require('./routes')(app)

app.get('/',(req,res)=>{
    res.send('server runnning')
})
app.listen(port,()=>{
    console.log(`Server is running at the port ${port}`)
})