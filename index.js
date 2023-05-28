/// 1. import express
const express = require("express");

//4.import cors
const cors = require("cors");

//import logic.js
const logic=require('./services/logic');
const { version } = require("mongoose");

//import jwttoken
const jwt = require('jsonwebtoken')

// 2. create a server using express
const server = express()

//5.use cors in server app
server.use(cors({
    origin:"http://localhost:4200"
}))

//6.parse json data to the js in server app

server.use(express.json())

//7. resolve client request - 5000/
//server.get("/",(req,res)=>{
   // res.send('GET METHOD')
//})

//server.post("/",(req,res)=>{
    //res.send('POST METHOD')
//})

///3. set up port for the server
server.listen(5000,()=>{
    console.log("listening on the port 5000.");
})
//application specific middleware
const appMiddleware =(req,res,next)=>{
    next()
    console.log('application specific middleware');

}
//use application specific middleware
server.use(appMiddleware)

// router specific middleware
//middleware for verifing token to check user is logined or not

const jwtMiddleware=(req,res,next)=>{
    //get token from eq header
    const token=req.headers['verify-token'];//token
    console.log(token);//token..... verify token
   try{
    const data=jwt.verify(token,'superkey2023')
    console.log(data);
    req.currentAcno=data.loginAcno
    next()
   }
   catch{
    res.status(401).json({message:'please login'})
   }
    
    console.log('Router specific middleware');
}

//Bank request
//register
//login
//balance enquiry
//fund transfer

//register
server.post('/register',(req,res)=>{

    logic.register(req.body.acno,req.body.username,req.body.password).then((result)=>{
res.status(result.statusCode).json(result)
    })
    ///res.send('regi')
// res.status(200).json({message:' request received'});
})

//login api call
server.post('/login',(req,res)=>{
    console.log("inside the login api call");
    console.log(req.body);
    logic.login(req.body.acno,req.body.password).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})
///get balance api call
server.get('/getbalance/:acno',jwtMiddleware,(req,res)=>{
console.log(req.params);
logic.getBalance(req.params.acno).then((result)=>{
    res.status(result.statusCode).json(result)
})
})

//fund transfer api call
server.post('/fund-transfer',jwtMiddleware,(req,res)=>{
    console.log('inside the fund transfer');
    console.log(req.body);
    logic.fundTransfer(req.currentAcno,req.body.password,req.body.toAcno,req.body.amount).then(
        (result)=>{
            res.status(result.statusCode).json(result)  
        }
    )
})

//get transcation api call
server.get('/getTransactionHistory',jwtMiddleware,(req,res)=>{
    console.log('inside the getTranscationHistory');
    logic.getTransactionHistory(req.currentAcno).then((result)=>{
        res.status(result.statusCode).json(result)    
    })
})
//deleting account
server.delete('/delete-account',jwtMiddleware,(req,res)=>{
    console.log('inside deleteAccount');
    logic.deleteUserAccount(req.currentAcno).then((result)=>{
        res.status(result.statusCode).json(result)
    })
})