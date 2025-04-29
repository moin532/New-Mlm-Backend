const app = require("./app");
const connectDatabase = require("./config/Database.js");
const cloudinary = require("cloudinary");

app.get("/", (req, res) => {
  res.send("backend Working properly");
});

connectDatabase();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`server listening on ${process.env.port}`);
});

//unhandles promise rejection
// process.on("unhandledRejection",err=>{
//     console.log(`Error: ${err.message}`)
//     console.log(`shuuting down the server unhandles rejection`);

//     server.close(()=>{
//         process.exit(1);
//     })
// })
