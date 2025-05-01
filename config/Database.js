const mongoose = require("mongoose");

const url = process.env.DB_URI

const connectDatabase = async () => {
    await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify:false,
        serverSelectionTimeoutMS: 10000,
      })
      .then((data) => {
        console.log(`Mongodb connected with server: ${data.connection.host}`);
      }).catch((error) => { 
        console.log(error);
      })
  };
  
  module.exports = connectDatabase;
