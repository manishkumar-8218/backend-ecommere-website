const ErrorHandler = require("../utils/errorhendler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
// Ragister a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is a sample id",
      url: "profileapiurl",
    },
  });
  sendToken(user, 201, res);
});

// login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given password and email both
  if (!email || !password) {
    return next(new ErrorHandler("please enter email & password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  const isPasswordMatched = user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user, 200, res);
});

// Logout user
exports.logOut = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    massage: "logged Out",
  });
});

// forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  // get ResetPassword token

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  const message = `if you had forgoten your password then here you can recover your password:->\n\n${resetPasswordUrl}\nclick here for recovering you password`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Ghar se mgao password recovery`,
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// reset password

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // createing token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "reset password token has been expired or invalid token",
        404
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match", 404));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});
// Get user detelies
exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{
  const user =await User.findById(req.user.id);
  res.status(200).json({
    success:true,
    user,
  });
});
// Update password
exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{
  const user =await User.findById(req.user.id).select("+password");
  const isPasswordMatched = user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("password does not match", 400));
  }
  if(req.body.newPassword!==req.body.confirmPassword){
    return next(new ErrorHandler("password does not match",400));
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user,200,res)
});

// update user profile
exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{
  const newUserData={
    name:req.body.name,
    email:req.body.email,
  };

  // we will add cloudinary later

  const user =await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });
  res.status(200).json({
    success:true
  })
});

// get all users(admin)
exports.getAllUsers=catchAsyncErrors(async(req,res,next)=>{
  const users=await User.find();
  res.status(200).json({
    success:true,
    users
  });
});


// get single users deteails(admin)

exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{
  const user=await User.findById(req.params.id);
  if(!user){
    return next(
      new ErrorHandler(`User does not exist with id :${req.params.id}`)
    )
  }
  res.status(200).json({
    success:true,
    user
  });
});

// update user role
exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{
  const newUserData={
    name:req.body.name,
    email:req.body.email,
    role:req.body.role,
  };
  const user =await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  });
  res.status(200).json({
    success:true
  })
});



// delete user as (admin)


exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{
  const user=await User.findById(req.params.id);

  // we will remove cloudinary later
  if(!user){
    return next(
      new ErrorHandler(`user does not exist with id:${req.params.id}`)
    );
  }

  await user.remove();
  res.status(200).json({
    success:true,
    message:"User deleted successfully"
  })
})