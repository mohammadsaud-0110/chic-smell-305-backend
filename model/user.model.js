const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true },
    role: { type: String, enum: ['client', 'trainer','admin'], default: 'client' },
    approved: { type: Boolean, default: false },
    expertise: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: null
    },
    price:{
      type:Number,
      default:null
    },
    isBlocked:{
      type:Boolean,
      default:false
    }
  });

const UserModel = mongoose.model("user",userSchema);

module.exports = {
    UserModel
}
