const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/reg")
.then( () => {
    console.log('Mongodb connected');
}) 
.catch(() => {
    console.log('Failed to connect mongodb');
})


const loginSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmPswd:{
        type:String,
        required:true
    }
})

const collection = mongoose.model("Users", loginSchema);

module.exports = collection;
