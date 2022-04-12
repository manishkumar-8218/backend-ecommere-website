const ErrorHandler = require("../utils/errorhendler");

module.exports = (err,req,res,next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "internal server error";

  //  wrong mongodb id error
  if (err.name==="CastError"){
    const message=`Resource not found .Invalid:${err.path}`;
    err=new ErrorHandler(message,400);
  }

  // mongoose duplicate key error
  if(err.code===11000){
    const message=`Duplicate ${Object.keys(err.keyValue)} Entered`
    err = new ErrorHandler(message,400);
  }
  //wrong JWT error
   if(err.name==="JsonWebTokenError"){
    const message=`json webtoken is invaid, try agian`
    err = new ErrorHandler(message,400);
  }
  // JWT  expire error
  if(err.name==="TokenExpireError"){
    const message=`json webtoken is expired, try agian`
    err = new ErrorHandler(message,400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message
  });
};
// module.exports=ErrorHandler