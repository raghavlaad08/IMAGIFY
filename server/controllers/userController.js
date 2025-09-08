import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/chat.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// API to register user
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password, // will be hashed in model pre-save
    });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits,
      },
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.code === 11000 ? "Email already registered" : error.message,
    });
  }
};

// API to login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          credits: user.credits,
        },
      });
    }

    return res.json({ success: false, message: "Invalid Email or Password" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// API to get user data
export const getUser = async (req, res) => {
  try {
    const user = req.user; // populated from protect middleware
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//API to get published Imagess
export const getPublishedImages = async (req,res)=>{
  try{
    const publishedImageMessages = await Chat.aggregate([
      {$unwind :"$messages"},
    {
      $match : {
        "messages.isImage":true,
        "messages.isPublished":true
         


      }
    },
  {
    $project :{
      _id:0,
      imageUrl:"$message.content",
      username:"$username"

    }
  }])
  res.json({success:true,images:publishedImageMessages.reverse()})

  }catch(error){

    return res.json({success:false,message:error.message});

  }
}
