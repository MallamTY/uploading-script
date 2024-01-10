import express, { response } from "express";
import cors from "cors";
import dbConnect from "./dbConnet.js";
import axios from 'axios';
import uploadImageToS3 from "./AWSSetup.js";
import Cars from "./carModel.js"
import { MONGO_URI } from "./config.js";
import translate from "translate-google";



const port = 8000;
const mongoURI = MONGO_URI;



const app = express();

app.use(express.json());
app.use(cors());



const start = async(url) => {
   try {
    await dbConnect(url);
    app.listen(port, () => {
        console.log(`\nServer listening on port ${port}`);
    })
   } catch (error) {
    console.log(error);
   }
}


function extGetter(link) {
    const linkSPlitter = link.split(".");
    const ext = linkSPlitter[linkSPlitter.length-1];
    return ext;
}

app.post("/", async(req, res) => {
    try {

        let {vehicleMake, vehicleID, vehiclePopular, vehicleLogo, vehicleModals} = req.body;

        if (vehicleLogo == null) {
            vehicleLogo = 'https://res.cloudinary.com/de4hdsbtn/image/upload/v1676690100/compact-car_ltnrwu.png';
        }
        const ext = extGetter(vehicleLogo);
        const result = await axios.get(vehicleLogo, {responseType: "arraybuffer"});
        const uplaodedImage = await uploadImageToS3(result.data, vehicleMake, ext);
        if (!uplaodedImage) {
            return res.status(404).json({
                status: 'failed',
                response: 'Error getting you image this time'
            })
        }

        vehicleLogo = uplaodedImage.Location;

        const modelResolver = async(carModel) => {
            if (!carModel.image || carModel === "") {
                const url = 'https://res.cloudinary.com/de4hdsbtn/image/upload/v1676690100/compact-car_ltnrwu.png';
                const ext = extGetter(url);
                const response = await axios.get(url, {responseType: "arraybuffer"});
                const uplaodedImage = await uploadImageToS3(response.data, carModel.name, ext);

                if (!uplaodedImage) {
                    return res.status(404).json({
                        status: 'failed',
                        response: 'Error getting you image this time'
                    })
                }

                carModel.image = uplaodedImage.Location;
            }

            const ext = extGetter(carModel.image);
            const response = await axios.get(carModel.image, {responseType: "arraybuffer"});
            const uplaodedImage = await uploadImageToS3(response.data, carModel.name, ext);

            if (!uplaodedImage) {
                return res.status(404).json({
                    status: 'failed',
                    response: 'Error getting you image this time'
                })
            }

            carModel.image = uplaodedImage.Location;
        };

        let returnedVehicle = await Promise.all(vehicleModals.map(modelResolver));

        returnedVehicle = {
            vehicleMake,
            vehicleID,
            vehiclePopular,
            vehicleLogo,
            vehicleModals
        };
        
        const updatedCar = await Cars.create({...returnedVehicle});

        if (!updatedCar) {
            console.log(`Error updating record in the database this time`);
        }
        return res.status(200).json({
            status: 'success',
            response: "Vehicle record successfully uploaded to AWS and stotred in the database"
        });
        
            // return res.status(404).json({
            //     status: 'failed',
            //     response: 'Error uploading your Image to AWS this time'
            // })
           

        // return res.status(404).json({
        //     status: 'failed',
        //     response: 'Error getting you image this time'
        // })
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.post("/translator", async(req, response) => {
   try {
    const data = req.body.vehicleModals;
    let translatedData = await Promise.all(data.map(async (item) => {
        const name_ar = await translate(item.name, { to: 'ar' });
        const classification_ar = await translate(item.classification, { to: 'ar' });
        
        return {
          ...item,
          name_ar: name_ar,
          classification_ar: classification_ar,
        };
      }));
      
      const vehicleMake_ar = await translate(req.body.vehicleMake, { to: 'ar' });
      translatedData = translatedData;
      //console.log(translatedData)
      if (translatedData) {
        return response.status(200).json({
            vehicleMake_ar,
            data: translatedData
        })
      }
   } catch (error) {
    console.error(error);
   }
      
})

app.put('/add-translated-fields/:id', async(req, res) => {
   try {
     const body = req.body.data;
     const carId = req.params.id;
     let bodyIndex = 0;  
     let cars = await Cars.findById(carId);
     for (const carModel of cars.vehicleModals) { 
        if (body[bodyIndex]) {
             carModel.name_ar = body[bodyIndex].name_ar;
             carModel.classification_ar = body[bodyIndex].classification_ar;
             bodyIndex += 1;
         
        }
        //  let index = cars.vehicleModals.indexOf(carModel);
        // if (index < 89) {
        //     continue
        // }
        // else {
        //     if (body[bodyIndex]) {
        //         carModel.name_ar = body[bodyIndex].name_ar;
        //         carModel.classification_ar = body[bodyIndex].classification_ar;
        //         bodyIndex += 1;
        //     }
        // }
    }
    cars.vehicleMake_ar = req.body.vehicleMake_ar;
    cars.markModified('vehicleModals');
        await cars.save();
        res.status(200).json({
        status: "success",
        message: "Translated fields added"
    })
   } catch (error) {
    console.log(error);
   }
})

app.get('/get-all-cars', async(req, res) => {
    const cars = await Cars.find();
    const carsCount = await Cars.find().count();
    res.status(200).json({
        count: carsCount,
        cars
    })
})
start(mongoURI);