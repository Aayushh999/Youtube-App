import mongoose, {Schema} from 'mongoose';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

const userSchema = new Schema(
    {
        username : {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email : {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname : {
            type: String,
            required: [true, "Fullname is required"],
            trim: true,
            index: true,
        },
        avatar : {
            type: String,   // cloudinery service url
            required: [true, "Avatar is required"],
        },
        coverImage: {
            type: String,
        },
        watchHistory: {
            type: Schema.Types.ObjectId,
            ref: "Video",
        },
        password: {
            type: String,                 // encrypt the password
            required: [true, "Password is required"],
        },
        refreshToken: {                 // need to be understood
            type: String,
        }
    },
    {
        timestamps: true,
    }
)

userSchema.pre("save" , async function () {
    if(!this.isModified("password"))return next();

    this.password = bcrypt.hash(this.password,10)
    next();
} )

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password , this.password);
}

userSchema.methods.generateAccessTokens = function (){
    return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS.TOKEN.SECRET,
        {
            expiresIn: process.env.ACCESS.TOKEN.EXPIRY
        }
    )
}
userSchema.methods.generateRefreshTokens = function (){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH.TOKEN.SECRET,
        {
            expiresIn: process.env.REFRESH.TOKEN.EXPIRY
        }
    )
}

export const User = mongoose.model("User" , userSchema);

/*

userSchema.pre() --> 
pre is a hook basically used when w want to do something just before a request 
is sent ,like if user sent data, so just before recieving it we want to encrypt the password using
the bcrypt package.   

And the funtion definition is different from arrow function because the arrow function doesnt have
the reference of "THIS" keyword, since to update the info we need the reference of info/data.

userSchema.methods --> 
We can create custom methods for our own functionalit which gets added to the methods object 
OR check npm docs for more details.**

No need to add await to generate access and refresh tokens cuz these process are fast.
*/