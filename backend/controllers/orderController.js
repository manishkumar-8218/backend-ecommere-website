const Order=require('../models/orderModel');
const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhendler");
const catchAsyncError = require("../middleware/catchAsyncError");

// Create new Order
exports.newOrder=catchAsyncError(async(req,res,next)=>{
    const{
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    }=req.body;
    const order=await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,
    });
    res.status(201).json({
        success:true,
        order,
    });
});
// get single order 
exports.getSingleOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );
    if (!order){
        return next(new ErrorHandler("order not found with this id",404));
    }
    res.status(200).json({
        success:true,
        order,
    });
});

// get logged in user Orders
exports.myOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find({user:req.user._id});


    res.status(200).json({
        success:true,
        orders,
    })
})
// get all order admin
exports.getAllOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find();
    
    let totalAmount=0;
    orders.forEach((order)=>{
        totalAmount=order.totalPrice;
    });
    
    res.status(200).json({
        success:true,
        totalAmount,
        orders,
    });
});

// get update orders status-- admin
exports.updateOrders=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);
    if (!order){
        return next(new ErrorHandler("order not found with this id ",404));
    }
    if(order.orderstatus=="Delivered"){
        return next(new ErrorHandler("you have already deliverd this order",400));
    }

    order.orderItems.forEach(async(o)=>{
        await updateStock(o.Product,o.quantity);
    })
    order.orderstatus=req.body.status;
    if (req.body.status==="Delivered"){
        order.deliveredAt=Date.now();
    }
    await order.save({validateBeforeSave:false});

    
    res.status(200).json({
        success:true,
     });
});
async function  updateStock(id,quantity){
    const product=await Product.findById(id);
    product.Stock-=quantity;
    await product.save({validateBeforeSave:false});
}

// delete order admin
exports.deleteOrders=catchAsyncError(async(req,res,next)=>{
    const order=await Order.find(req.params.id);

    if (!order){
        return next(new ErrorHandler("order not found with this id ",404));
    }
    await order.remove();
    
    res.status(200).json({
        success:true, 
    });
});