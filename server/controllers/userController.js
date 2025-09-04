import User from "../models/User.js";
import jwt from 'jsonwebtoken'
import bcrypt from bcrypt.js



//Generate JWT
const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'30d'
    })
}


//  API to register user
export const registerUser=async(req,req)=>{
    const{name,email,password}= req.body;


    try{
        const userExists = await User.findOne({email})

        if (userExists){
            return res.json({success:false, message:"User already Exists"})
        }
        const user=await User.create({name,email,password})

        const token=generateToken(user._id)

        res.json({success:true,token})
        

    }
    catch(error){
        return res.json({success:false, message:error.message})

    }



}

//API to login User

export const loginUSer= async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user = await User.findOne({email})
        if(user){
            const isMatch= await bcrypt.compare(password,user.password)

            if(isMatch){
                const token=generateToken(user._id);
                return res.json({success:true,token})
            }


        }
        return res.json({success:false, message:"Invalid Email or password"})


    }
    catch(error){
        return req.json({success:false, message:error.message })

    }


}