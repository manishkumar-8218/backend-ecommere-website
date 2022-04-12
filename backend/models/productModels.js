const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    name: {
        type:String,
        required:[true,"Please enter product Name"],
        trim: true
    },
    description:{
        type:String,
        required:[true,"Please enter product Description"]
    },
    price: {
        type:Number,
        required:[true,"Please enter product Price"],
        maxlength:[true,"Price can't exceed 8 numbers"]
    },
    ratings:{
        type:Number,
        default:0
    },
    image:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        required:[true,"Please enter product Caregory"]
    },
    Stock:{
        type:Number,
        required:[true,"Please enter product Stock"],
        maxlength:[4,"stock cannot exceed 4 characters"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true,
             },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
       type:mongoose.Schema.ObjectId,
       ref:"User",
       required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    }
})


module.exports=mongoose.model("product",productSchema)