import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../models/UserSchema.js'
import Doctor from "../models/DoctorSchema.js"



const generateToken = user => {
    return jwt.sign({id:user._id,role:user.role}, process.env.JWT_SECRET_key, {
        expiresIn:'15d',
    })
 }


export const register = async (req,res) => {
    const {email, password, name, role, photo, gender} = req.body
    try {

        let user = null
        if(role === 'patient'){
            user=await User.findOne({email})
        }
        else if(role==='doctor'){
            user=await Doctor.findOne({email})
        }

        // check if user exist
        if(user){
            return res.status(400).json({message:'User already exist'})
        }

        // #hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)

        if(role==='patient'){
            user = new User ({
                name,
                email,
                password:hashPassword,
                photo,
                gender,
                role
            })
        }

        if(role==='doctor'){
            user = new Doctor ({
                name,
                email,
                password:hashPassword,
                photo,
                gender,
                role
            })
        }
        await user.save()
        res.status(200).json({success:true, message:"User successfully created"})
        
    } catch(err) {
        res.status(500).json({success:true, message:"Internal server error"})
    };
};

export const login = async (req,res) => {
    const {email} = req.body


    try {
        let user = null

        const patient = await User.findOne({email})
        const doctor = await Doctor.findOne({email})

        if(patient){
            user=patient
        }
        if(doctor){
            user=doctor
        }

        // check if user exits or not 

        if(!user){
            return res.ststus(404).json({message: "User not found"});
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password,user.password)

        if(!isPasswordMatch){
            return res.status(400).json({status:false, message:"Invalid credental"});
        }

        // get toke

        const token = generateToken(user);

        const {password,role,appointments,...rest} = user._doc

        res
        return res.status(200).json({status:true, message:"Successfuly login" , token, data: {...rest}, role});

    } catch (err) {
        res
        return res.status(500).json({status:false, message:"Failed login"});
    }
};