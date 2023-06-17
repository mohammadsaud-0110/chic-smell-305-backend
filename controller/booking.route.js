const express = require("express");
const {UserModel} = require("../model/user.model")
const {BookingModel} = require("../model/booking.model")
const { authMiddleWare } = require("../middleware/jwt.middleware")

const bookingRoute = express.Router();


//get all booking order with client and trainer name
bookingRoute.get("/", async(req,res)=>{
    try {
        let data = await BookingModel.find().populate("trainer client","name");
        res.status(200).json({ data, ok: true });
    }
    catch (error) {
        res.status(500).json({ok:false, message: error.message });
    }
    
});

// to book session, no conflict checking done here
bookingRoute.post('/book', authMiddleWare,async (req, res) => {
  const { trainerID, startTime, endTime } = req.body;

  try {
    // Check if trainer exist in the database
    const trainerFind = await UserModel.findById(trainerID);
    if (!trainerFind){
      return res.status(400).json({ message: 'Invalid trainer ID', ok:false });
    }
      // Create the booking
        const booking = new BookingModel({
          trainer: trainerID,
          client: req.user.id,
          start_time: startTime,
          end_time: endTime,
        });
        // Save the booking to the database
        await booking.save();
        return res.status(201).json({ message: 'Booking request sent successfully', ok:true });
    
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message, ok:false });
  }
});

//order of particular client by userID
bookingRoute.get('/clientOrder/:userID', authMiddleWare, async (req, res) => {
    try {
      // Get the logged-in client's ID
      const clientId = req.params.userID;

      // Find all booking requests for the logged-in photographer from the database
      const allorders = await BookingModel.find({ client: clientId }).populate('trainer', 'name email');
      res.status(200).json({ ok: true, allorders });
    } 
    catch (err) {
      res.status(500).send({ error: err.message, message: 'Server Error', ok: false });
    }
});

//all orders of a particular trainer by ID
bookingRoute.get('/trainerOrder/:trainerID', authMiddleWare, async (req, res) => {
  try {
    // Get the logged-in photographer's ID
    const trainerID = req.params.trainerID;

    // Find all booking requests for the logged-in photographer from the database
    const bookings = await BookingModel.find({ trainer: trainerID }).populate('client', 'name email');

    res.json({ ok: true, bookings });
  }
  catch (err) {
    res.status(500).send({ error: err.message, message: 'Server Error', ok: false });
  }
});

//to ACCEPT or REJECT  the booking order from the client by the trainer
bookingRoute.patch("/request/:bookingID", authMiddleWare , async(req,res)=>{
  try {
    const bookingID = req.params.bookingID;
    const payload = req.body;
    await BookingModel.findByIdAndUpdate({ "_id": bookingID }, payload)
    res.status(200).json({ ok: true, message: "Booking Status Updated" });
  }
  catch (error) {
    res.status(500).json({ ok: false, message: err.message });
  }
})

//cancel order by client
bookingRoute.patch("/cancel/:bookingID", authMiddleWare , async(req,res)=>{
  try {
    const bookingID = req.params.bookingID;
    const payload = req.body;
    await BookingModel.findByIdAndUpdate({ "_id": bookingID }, payload)
    res.status(200).json({ ok: true, message: "Booking Cancelled!" });
  }
  catch (error) {
    res.status(500).json({ ok: false, message: err.message });
  }
})




module.exports = {
    bookingRoute
}