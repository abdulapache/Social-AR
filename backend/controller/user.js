const User = require('../model/user.js');
const Posts = require('../model/post')
const { sendEmail } = require("../middleware/sendEmail")
const crypto = require("crypto")


exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ success: false, message: "User already exist" })
        user = await User.create({ name, email, password, avatar: { public_id: "sample_id", url: "sample_id" } });


        const token = await user.generateToken();

        const opetion = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        res.status(201).cookie("token", token, opetion).json({
            success: true,
            user,
            token
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

//login

exports.login = async (req, res) => {
    try {
        console.log('hello')
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return res.status(400).json({
                success: false, message: "User does not exist"
            });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false, message: "Incorect Password"
            })
        }
        const token = await user.generateToken();

        const opetion = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            httpOnly: true
        }


        res.status(200).cookie("token", token, opetion).json({
            success: true,
            user,
            token
        })
       
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}



exports.followUser = async (req, res) =>{
    try{
        const userToFollow = await User.findById(req.params.id)
        const loggedInUser = await User.findById(req.User._id)
        if(!userToFollow){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }


        if(loggedInUser.following.includes(userToFollow._id)){
            const indexFollowing = loggedInUser.following.indexOf(userToFollow._id)
            const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id)
            loggedInUser.following.splice(indexFollowing,1);
            userToFollow.followers.splice(indexFollowers,1);
            await loggedInUser.save()
            await userToFollow.save()     
            res.status(200).json({
                success:true,
                message:"user unflowed"
            })       
        }else{
            loggedInUser.following.push(userToFollow._id)
            userToFollow.followers.push(loggedInUser)
            await loggedInUser.save()
            await userToFollow.save()
            res.status(200).json({
                success:true,
                message:"follow reight"
            })   
        }
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


///logout

exports.logout = async (req, res)=>{
    try{
        res.status(200).cookie("token", null,{expires:new Date(Date.now()),httpOnly:true}).json({
            success:true,
            message:"User Is logout successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

///update password

exports.updatePassword = async (req, res)=>{
    try{
        const user = await User.findById(req.User._id).select("+password");
        const { oldPassword, newPassword } = req.body  
        console.log(req.body) 
        // if(!oldPassword || !newPassword){
        //     return res.status(400).json({
        //         success:false,
        //         message:"please provide old and new password"
        //     })
        // }
       
        const isMatch = await user.matchPassword(oldPassword)
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect old Password"
            });
        }
        console.log('hello')
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success:true,
            message:"Password Update SuccessFully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


//update profile

exports.updateProfile = async (req, res)=>{
    try{
        const user = await User.findById(req.User._id);
        const {name, email} = req.body
        if(name){
            user.name =name;
        }
        if(email){
            user.email=email
        }
        await user.save();
        res.status(200).json({
            success:true,
            message:"User Successfully update"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//delete my profile

exports.deleteUser = async (req, res)=>{
    try{
        const user = await User.findById(req.User.id)
        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;

       await user.remove();

       //logout user after deleting profile

       res.cookie("token", null,{expires:new Date(Date.now()),httpOnly:true})

//delete post by user

       for(let i=0; i<posts.length; i++){
       const post = await Posts.findById(posts[i])
       await post.remove();
       }

       for(let i=0; i<followers.length; i++){
        const follower = await User.findById(followers[i])
        const index = follower.following.indexOf(userId)
        follower.following.splice(index,1);
        await follower.save()
       }

       for(let i=0; i<following.lenght; i++){
        const follows = await User.findById(following[i])
        const index = follows.followers.indexOf(userId)
        follows.followers.splice(index,1);
        await follows.save()
       }

       res.status(200).json({
        success:true,
        message:"User Successfully Delete"
       })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//user profile get all data


exports.myProfile  = async (req, res)=>{
    try{
        const user  = await User.findById(req.User.id).populate('posts')
        res.status(200).json({
            success:true,
            user
        })
    
      }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
      }
}

exports.userProfile = async (req, res)=>{
    try {
        const user = await User.findById(req.params.id).populate('posts');
        if(!user){
            res.status(401).json({
                success:false,
                message:"User Not Found"
            })
        }
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.allUser = async (req, res)=>{
    try {
        const user = await User.find({});
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


// forget password


exports.forgetPassword = async (req, res)=>{
    try {
        const user = await User.findOne({email:req.body.email})
        if(!user){
            res.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        const resetPasswordToken  = user.getRestPasswordToken();
        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/api/vi/password/reset/${resetPasswordToken}`;
        const message = `reset your Password by clicking onthe link below: /n ${resetUrl}`;
        try {
            await sendEmail(
                {
                    email:user.email, 
                    subject:"Reset Password", 
                    message
            })
            res.status(200).json({
                success:true,
                message:`Email send to ${user.email}`
            })
        } catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined
            await user.save()
            res.status(500).json({
                success:false,
                message:error.message
            })
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


//reset Password


exports.resetPassword = async (req, res)=>{
    console.log('hello')
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt:Date.now()}
        })
if(!user){
    return res.status(401).json({
        success:false,
        message:"Token is valid or has expire"
    })
}
user.password = req.body.password;

user.resetPasswordToken = undefined
user.resetPasswordExpire = undefined

await user.save();
res.status(200).json({
    success:true,
    message:"Password update SuccessFully"
})

    } catch (error) {
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
}