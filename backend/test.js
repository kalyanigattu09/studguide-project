const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://studguide:StudGuide2026@cluster0.ew8bcyo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => {
  console.log("Connected!");
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});