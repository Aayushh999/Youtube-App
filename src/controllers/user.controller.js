import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinaryFileHandling.js'
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        // when we save user, mongoose makes it necessary to valide the user(ie. logged in or not) but here validation is not necessary 

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Could not generate access and refresh tokens")
    }
}

const registerUser = asyncHandler( async (req , res) => {

    // Step 1 --> get user details from frontend (API or form data)
    // Step 2 --> validate data , if empty or not
    // Step 3 --> check if user already exists via unique username or email
    // Step 4 --> check for images , avatar , coverimage
    // Step 5 --> upload to cloudinary
    // Step 6 --> create user object - create entry in database
    // Step 7 --> remove password and refresh token from response
    // Step 8 --> check user creation
    // Step 9 --> return response

    // 1
    const { fullname, email, username, password } = req.body
    console.log("fullname : ", fullname);
    console.log("email : ", email);
    console.log("username : ", username);
    console.log("password : ", password);

    // if(fullname === ""){
    //     throw new ApiError(400, " fullname is required ")
    // }
    
    // 2
    if (
        [fullname, email, username, password].some((field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, " Fullname is required ");
    }

    // 3
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if ( existedUser ) {
        throw new ApiError(409, " User with username or email already exists ");
    }

    // 4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, " Avatar file is required ")
    }
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, " Avatar upload Unsuccessful ")
    }

    // 6
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

    // 7
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // 8
    if (!createdUser) {
        throw new ApiError(500, " Something went wrong while registering the user ")
    }

    // 9
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler( async(req , res) => {
    /*
    Step 1 - take data from req.body
    Step 2 - check unique username or email
    Step 3 - find the user 
    Step 4 - check password matches or not
    Step 5 - generate access and refresh tokens
    Step 6 - send data in secure cookies
    */

    const {username, email, password} = req.body;
    if (!username || !email) {
        throw new ApiError(400, "Username  or Email is required")
    }

    const user = await User.findOne({$or: [{username},{email}]})
    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await user.findById(user._id).select("-password -refreshToken")
    // apparently when we generated token the "user" reference we had is not the same in this 'loginUser' method so the 
    // refresh token field is empty in this 'user context' and hence we either need to update the refresh token to this user
    // or we need to call tthe database again and remove the unwanted feilds.

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged In Succesfully"
        )
    )
})

const logoutUser = asyncHandler(async(req , res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.stauts(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {},"Logged Out Succesfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
};