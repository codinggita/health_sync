import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  role: {
    type: String,
    enum: ["patient", "admin", "driver"],
    default: "patient",
  },
  gender: { type: String, enum: ["male", "female", "other"] },
  bloodType: { type: String },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Appointment" }],
  licenseNumber: { type: String, required: function () { return this.role === "driver"; } },
  ambulanceNumber: { type: String, required: function () { return this.role === "driver"; } }, // New field
});

export default mongoose.model("User", UserSchema);