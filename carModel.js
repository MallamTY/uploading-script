import mongoose from "mongoose";



const carSchema = new mongoose.Schema({
    vehicleMake: {
        type: String,
        trim: true,
        required: true
    },

    vehicleMake_ar: {
        type: String,
        trim: true,
        required: true
    },

    vehicleID: {
        type: String,
        trim: true,
        required: true
    },

    vehiclePopular: {
        type: String,
        trim: true,
        required: true
    },
    
    vehicleLogo: {
        type: String,
        trim: true,
        required: true
    },

    vehicleModals: {
        type: [],
        required: true
    }
     
}, {
    timestamps: true
});


const carModel = mongoose.model('cars', carSchema);

export default carModel;


