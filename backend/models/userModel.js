const mongoose = require("mongoose");
const validator=require("validator");
const bcrypt = require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"please enter your name"],
        maxlength:[30,"name cannot exced 30 charecter"],
        minlength:[3,"name should have more than 3 charecter"]
    },
    email: {
        type: String,
        required: [true,"please enter your email"],
        unique:true,
        validate:[validator.isEmail,"please enter a valid Email"]
    },
    password: {
        type: String,
        required: [true,"please enter your password"],
        minlength:[8,"password should greater than 8 charecter"],
        select:false,
    },
    avatar:{
          public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
    },
    role: {
        type:String,
        default:"user",
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

// bcrypt password
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
})
// JWT TOKEN
userSchema.methods.getJWTToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};


// COMPARE PASSWORD
userSchema.methods.comparePassword=async function(enteredPassword){
   return await bcrypt.compare(enteredPassword,this.password);
}


// reset password by reset token
userSchema.methods.getResetPasswordToken=function(){
// Genrating password

const resetToken=crypto.randomBytes(20).toString("hex");

// hashing and adding reseyPassword \toke to userScheem
this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
this.resetPasswordExpire=Date.now()+15*60*1000;
return resetToken;
}

module.exports=mongoose.model("user",userSchema)