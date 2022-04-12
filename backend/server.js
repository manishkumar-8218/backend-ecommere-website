const app = require("./app")
const dotenv =require("dotenv");
const connectDatabase=require("./config/database")

// uncaught error handling

process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log("Shutting down the server due to uncaught exeception");
    process.exit(1);
});


// config
dotenv.config({path:"backend/config/config.env"})

// database connection
connectDatabase()


const server=app.listen(process.env.PORT,()=>{
    console.log(`server listen on port no ${process.env.PORT}`);
}) 


// unhandle promise rejection

process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log("Shutting down the server due to unhandle promise rejection");


    server.close(()=>{
        process.exit(1);
    });
});