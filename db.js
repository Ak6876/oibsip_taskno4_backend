const mongoose = require('mongoose');
//congif file
const mongoURI = "mongodb://127.0.0.1:27017/Task4_Login"

const connectToMongo = async()=>{
   try{ await mongoose.connect(mongoURI)
        console.log("Connected To Mongo Successfully")
        }
   catch (error) {
        handleError(error);
      }
}
module.exports = connectToMongo