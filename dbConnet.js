import mongoose from "mongoose";


const connectDB = async(url) => {
    try {
        await mongoose.connect(url);
        console.log(`\nConnection to the car database established`);

    } catch (error) {
        console.log(error);
    }
}


export default connectDB;
