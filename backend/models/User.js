const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    password:{
        type:String,
        required:false,
        default:""
    },

    role:{
        type:String,
        enum:["student","landlord","admin"],
        required:true
    },

    provider:{
        type:String,
        enum:["email","google"],
        default:"email"
    },

    walletAddress:{
        type:String,
        default:""
    }

},
{
    timestamps:true
});

module.exports = mongoose.model("User",UserSchema);