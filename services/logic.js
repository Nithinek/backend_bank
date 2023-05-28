///import db.js
const { response } = require('express');
const db=require('./db')


//import jwt token
const jwt=require('jsonwebtoken')

//logic for register -asynchoronus function- promise- .then
const register=(acno,username,password)=>{
console.log(' inside register works');
//acno in db
//yes
return db.User.findOne({
    acno
}).then((response)=>{
  //  console.log(response);
if(response){
    return{
        statusCode:401,
        message:'acno Already registered'
    }
}
else{
    //create new object for registrtion
    const newUser= new db.User({
        acno,
        username,
        password,
        balance:2000,
        transaction:[]
    })
    //to save in database
    newUser.save()
    //to send response back to the client
    return{
        statusCode:200,
        message:'sucessfully registered'
    }
}

})

}
//logic for login- asynchronus function - promise- .then
const login=(acno,password)=>{
console.log("inside the login function");
return db.User.findOne({acno,password}).then((result)=>{
   //acno present in database
    if(result){
        //Token generated
        const token=jwt.sign({loginAcno:acno},'superkey2023')
        return{
            statusCode:200,
            message:'successfully logged in',
            currentUser:result.username,
            token,//send to the client
            currentAcno:acno//sent to the client
        }
    }
    //acno not present in database
    else{
        return{
            statusCode:401,
            message:'Invalid data'
        }
    }
})
}

//logic for balance enquiry
const getBalance=(acno)=>{
//check acno in db
return db.User.findOne({acno}).then((result)=>{
    if(result){
        return{
            statusCode:200,
            balance:result.balance
        }
    }
    else{
        return{
            statusCode:401,
            message:'Invalid Data'
        }
    }
})

}

const fundTransfer=(fromAcno,fromAcnoPswd,toAcno,amt)=>{
//convert amt into num
let amount=parseInt(amt)

//check fromacno in mongodb
return db.User.findOne({
    acno:fromAcno,
    password:fromAcnoPswd
}).then((debitdetails)=>{
    if(debitdetails){
        //to check toacno
        return db.User.findOne({acno:toAcno}).then((creditDetails)=>{
            if(creditDetails){
                //check the balance>amount
                if(debitdetails.balance>amount){
                    debitdetails.balance-=amount;
                    debitdetails.transaction.push({
                        type:"Debit",
                        amount,
                        fromAcno,
                        toAcno
                    })
                    //save changes to the mongodb
                    debitdetails.save()

                    //update to the toAcno
                    creditDetails.balance+=amount
                    creditDetails.transaction.push({
                        type:"Credit",
                        amount,
                        fromAcno,
                        toAcno
                    })
                    //save to mongodb
                    creditDetails.save()

                    //send response to the client side
                    return{
                        statusCode:200,
                        message:'Fund transfer successfull'
                    }

                }
            
                else{
                    return{
                        statusCode:401,
                        message:'Insufficent balance'
                    }
                }

            }
            else{
                return{
                    statusCode:401,
                    message:'Invalid Data'
                }
            }
        })
    }
    else{
        return{
            statusCode:401,
            message:'Invalid Data'
        }
    }
})
}

//get transcation history
const getTransactionHistory =(acno)=>{
return db.User.findOne({acno}).then((result)=>{
    if(result){
        return{
            statusCode:200,
            transaction:result.transaction
        }
    }
    else{
        return{
            statusCode:401,
            message:'Invalid Data'
        }
    }
})
}

const deleteUserAccount=(acno)=>{
//acno delete from mongodb
return db.User.deleteOne({acno}).then((result)=>{
return{
    statusCode:200,
    message:'account removed successfully'
}
})
}
//export
module.exports={
    register,
    login,
    getBalance,
    fundTransfer,
    getTransactionHistory,
    deleteUserAccount

}