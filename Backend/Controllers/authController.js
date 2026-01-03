import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (user) => {
  
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "15d" }
  );
};

export const register = async (req, res) => {
  const { email, password, name, role, photo, gender, licenseNumber, ambulanceNumber } = req.body;
  try {
    let user = null;

    if (role === "patient" || role === "driver") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    }

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    if (role === "patient") {
      user = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    } else if (role === "driver") {
      if (!licenseNumber || !ambulanceNumber) {
        return res.status(400).json({ success: false, message: "licenseNumber and ambulanceNumber are required for drivers" });
      }
      console.log("Registering driver with:", { email, name, licenseNumber, ambulanceNumber });
      user = new User({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
        licenseNumber,
        ambulanceNumber,
      });
    } else if (role === "doctor") {
      user = new Doctor({
        name,
        email,
        password: hashPassword,
        photo,
        gender,
        role,
      });
    }

    await user.save();
    res.status(200).json({ success: true, message: "User successfully created" });
  } catch (err) {
    console.error("Error in register:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: "Validation error", errors: err.errors });
    }
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email } = req.body;
  
  
  try {
    let user = null;

    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });
    
    
    if (patient) user = patient;
    if (doctor) user = doctor;
    
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ status: false, message: "Invalid credentials" });
    }
    
    const token = generateToken(user);
    
    const { password, role, appointments, ...rest } = user._doc;
    
    res.status(200).json({
      status: true,
      message: "Successfully logged in",
      token,
      userId: user._id,
      data: { ...rest },
      role,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: "Failed login" });
  }
};