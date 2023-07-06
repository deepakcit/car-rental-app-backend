const express = require("express");
const mongoose = require("mongoose");
const router = express.Router()
const Car = mongoose.model("Car")
const User = mongoose.model("User")
const RentedCars = mongoose.model("RentedCars")

const requireLogin = require("../middleware/requireLogin");
const requireUserLogin = require("../middleware/requireUserLogin");

router.post("/addcar",requireLogin, (req, res) => {
    // const {authorization}=req.headers
    // console.log(req.user)
    const {model,carNumber,seatingCapacity,rentPerDay,carImage}=req.body

    if(!model || !carNumber || !seatingCapacity || !rentPerDay || !carImage){
        return res.status(422).json({error:"Please fill all the fields"})
      }
    const addCar = new Car({
        model: model,
        carNumber: carNumber,
        seatingCapacity: seatingCapacity,
        rentPerDay: rentPerDay,
        carImage: carImage,
        addedBy:req.user,
        // agencyId:req.user._id
    })
    addCar.save()
    .then(result=>{
        
        // console.log(result)
        const {addedBy} = result
        res.json({message:result,addedBy})
    })
})
// changed
// router.post("/addedcar",requireLogin,(req,res)=>{
//     const {agencyId} = req.body
//     Car.find({addedBy:agencyId})
//     .then(result=>{
//         // console.log(result)
//         res.json(result)
//     })
// })

router.post("/viewpostedcars",requireLogin,(req,res)=>{
    // console.log(req.user)
    const {_id} = req.user
    // const {agencyId} = req.body
    Car.find({addedBy:_id})
    .then(result=>{
        // console.log(result)
        if(!result.length){
            return res.json({error:"No cars added, add some cars by clicking on Add"})
        }
        return res.json(result)
    })
})

router.get("/allcars",requireLogin,(req,res)=>{
    // console.log(req.headers)
    Car.find()
    .then(cars=>{
        if(cars.length){
            res.json(cars)
        }
        else{
            res.status(422).json({error:"No cars are available for rent"})
        }
    })
})

router.post("/rentcar",requireUserLogin,(req,res)=>{
    const {model,days} = req.body
    // console.log(req.body)
    if(!days){
        return res.status(422).json({error:"Select the number of days by clicking on dropdown"})
    }
    // console.log(req.body)
    Car.findOne({model:model})
    .then(savedCar=>{
        const bookedCar = new RentedCars({
            model:savedCar.model,
            carNumber:savedCar.carNumber,
            seatingCapacity:savedCar.seatingCapacity,
            rentPerDay:savedCar.rentPerDay,
            carImage:savedCar.carImage,
            totalPrice: savedCar.rentPerDay*parseInt(days),
            rentedFor:req.user.email,
            agencyId:savedCar.addedBy
        })
        // console.log(bookedCar)
        bookedCar.save()
        .then(result=>{
            res.json({message:`${model} rented successfully for ${days} days`})
        })
    })
})

router.get("/cartitems",requireUserLogin,(req,res)=>{
    
    // const {rentedFor} = req.body
    // console.log(rentedFor)
    RentedCars.find({rentedFor:req.user.email})
    .then(rentedcars=>{
        // console.log(rentedcars)
        if(rentedcars.length==0){
           return res.status(401).json({error:"Rent a car first to see your rented car"})
        }
        else{
            // console.log(rentedcars)
            res.json(rentedcars)
        }
    })
})
router.get("/totalrenteditem",requireUserLogin,(req,res)=>{
    const {email} = req.user
    // console.log(email)
    RentedCars.find({rentedFor:email})
    .then(rentedCarData=>{
        // console.log(rentedCarData.length)
        res.json(rentedCarData.length)
    })
})

router.get("/bookedcars",requireLogin,(req,res)=>{
   const {_id} =req.user
//    console.log(req.user)

//    console.log(_id)
   RentedCars.find({agencyId:_id})
   .then(bookedCarData=>{
    if(!bookedCarData){
        return res.status(422).json({error:"No Booked cars yet"})
    }
    else{
        // console.log(bookedCarData)
        return res.json(bookedCarData)
    }
   })
})

router.delete("/deletecar",requireUserLogin,(req,res)=>{
    // console.log(req.body)
    RentedCars.findOneAndDelete({_id:req.body._id})
    .then(result=>{
        res.json(result)
    })
    .catch(err=>console.log(err))
})

router.delete("/deleteagencycar",requireLogin,(req,res)=>{
    // console.log(req.body)
    Car.findOneAndDelete({_id:req.body._id})
    .then(result=>{
        res.json(result)
    })
    .catch(err=>console.log(err))
})

module.exports = router