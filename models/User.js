// import mongoose from "mongoose";
// import bcrypt from 'bcryptjs'


// const userSchema = new mongoose.Schema({
//     username:{
//         type: String,
//         required:[true,'Please provide a username'],
//         unique:true,
//         trim:true,
//         minlenghth:[3,'Username must be at least 3 characters long']
//     },
//     email: {
//         type: String,
//         required:[true,'Please provide a email'],
//         unique:true,
//         lowercase:true,
//         match:[/^\S+@\S+\.\S+$/,"Please provide a vaild email",]
//     },
//     password: {
//         type:String,
//         required:[true,'Please provide a valid email'],
//         minlength:[6,'Password must be at least 6 characters long '],
//         select: false
//     },
//     profileImage:{
//         type:String,
//         default:null
//     }
// },{
//     timestamps:true
// })

// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) {
//         return next();
//     }

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password,salt)
// })
// // compare password method

// userSchema.methods.matchPassword = async function(enteredPassword) {
//     return await bcrypt.compare(enteredPassword,this.password);
// };

// const User = mongoose.model('User',userSchema) 

// export default User;

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:[true,'Please provide a username'],
        unique:true,
        trim:true,
        minlength:[3,'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required:[true,'Please provide a email'],
        unique:true,
        lowercase:true,
        match:[/^\S+@\S+\.\S+$/,"Please provide a valid email"]
    },
    password: {
        type:String,
        required:[true,'Please provide a password'],
        minlength:[6,'Password must be at least 6 characters long'],
        select: false
    },
    profileImage:{
        type:String,
        default:null
    }
},{
    timestamps:true
});

// ✅ Correct modern middleware
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password);
};

const User = mongoose.model('User',userSchema);

export default User;
