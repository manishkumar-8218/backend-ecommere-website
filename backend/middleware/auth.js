const User=require("../models/userModel")
const jwt=require("jsonwebtoken");
const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("../utils/errorhendler");

exports.isAuthenticatedUser=catchAsyncError(async(req,res,next)=>{
    const {token}=req.cookies;

    if(!token){
        return next (new ErrorHandler("please login to access this resource",401));
    }
    const decodedDate=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decodedDate.id);
    next();
});

exports.authorizeRoles=(...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next( new ErrorHandler(
                `ROle:${req.user.role}is not allowed to access this resource`,403
            ));
        }
        next();
    };
};