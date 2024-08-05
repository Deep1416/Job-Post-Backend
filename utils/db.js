import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongoose connected succesfull !!!");
  } catch (error) {
    console.log(error + "from  mongoose");
  }
};

export default connectDB;