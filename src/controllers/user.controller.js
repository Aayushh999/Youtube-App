import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinaryFileHandling.js'
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler( async (req , res) => {

    // -> get user details from frontend (API or form data)
    // -> validate data , if empty or not
    // -> check if user already exists via unique username or email
    // -> check for images , avatar , coverimage
    // -> upload to cloudinary 
    // -> create user object - create entry in database
    // -> remove password and refrwesh token from response
    // -> check user creation 
    // -> return response


    //Step 1
    const { fullname, email, username, password } = req.body
    console.log("fullname : ", fullname);
    console.log("email : ", email);
    console.log("username : ", username);
    console.log("password : ", password);

    // if(fullname === ""){
    //     throw new ApiError(400, " fullname is required ")
    // }
    

    // Step 2
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, " Fullname is required ");
    }


    // Step 3
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if ( existedUser ) {
        throw new ApiError(409, " User with username or email already exists ");
    }

    
    // Step 4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, " Avatar file is required ")
    }

    // Step 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, " Avatar upload Unsuccessful ")
    }


    // Step 6
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",        // if coverImage is present then add the url else return empty string
        /*
          apparenty this syntax sometimes may give error when user didnt send the coverimage , then it will show 
          cannot read properties of undefined,
          so as to remove it we need to valida coverr image as well ( traditionally ).
        */
        email,
        password,
        username: username.toLowerCase()
    })


    // Step 7
    const createdUser = await User.findById(user._id).select("-password -refreshToken")


    // Step 8
    if (!createdUser) {
        throw new ApiError(500, " Something went wrong while registering the user ")
    }


    // Step 9
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

export {registerUser};