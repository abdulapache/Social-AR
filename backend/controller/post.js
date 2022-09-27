const Post = require('../model/post.js')
const User = require('../model/user.js')


exports.createPost = async (req, res)=>{
try{
    const newPostData ={
        caption:req.body.caption,
        image:{
            public_id:"req.body.public_id",
            url:"req.body.url"
        },
        owner:req.User._id,
    };
    console.log(newPostData)
    const post = await Post.create(newPostData);
    const user = await User.findById(req.User._id);
    user.posts.push(post._id)
    await user.save();
    res.status(201).json({
        success:true,
        post
    });
}catch(error){
    res.status(500).json({success:false,message:error.message})
}
}



//delete post

exports.deletePost = async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
        }
        if(post.owner.toString() !==req.User._id.toString()){
            return res.status(401).json({
                success:false,
                message:"Unathourized"
            })
        }
await post.remove();
const user = await User.findById(req.User._id)
const index = user.posts.indexOf(req.params.id)
user.posts.splice(index,1);
await user.save();
return res.status(200).json({
    success:true,
    message:"Post delete"
})


    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



//like and dislike post


exports.likeAndUnlikePost = async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id)

if(!post){
    return res.status(404).json({
        success:false,
        message:"Post not found"
    })
}

if(post.likes.includes(req.User._id)){
    const index = post.likes.indexOf(req.User._id);
    post.likes.splice(index,1)
    await post.save();
    return res.status(200).json({success:true, message:"post unlike"})
}else{
    post.likes.push(req.User._id)
    await post.save();
    return res.status(200).json({success:true, message:"Post Like"})
}

    }catch(error){
        res.status(500).json({success:false,message:error.message})
    }
}




//post following  ....


exports.getPostOffFollowing = async (req, res)=>{
    try{
        const user = await User.findById(req.User._id)
        // .populate("following","posts")
        const post = await Post.find({
            owner:{
                $in:user.following
            }
        })
        res.status(200).json({success:true, 
            post
            // following:user.following
        })
    }catch(error){
       return res.status(500).json({
        success:true,
        message:error.message
       })
    }
}

//update caption

exports.updateCaption = async (req, res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({
                success:false,
                message:error.message
            })
        }
        if(post.owner.toString() !== req.User._id.toString()){
            return res.status(401).json({
                success:false,
                message:"unauthorizad person"
            })
        }
        post.caption = req.body.caption;
        await post.save()
        res.status(200).json({
            success:true,
            message:"Caption update SuccessFully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//comment system

exports.addComment = async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
        }

        let commentIndex = -1;

        post.comments.forEach((item, index)=>{
            if(item.user.toString() === req.User._id.toString()){
                commentIndex = index;
            }
        })

        if(commentIndex !== -1){
            post.comments[commentIndex].comment = req.body.comment
            await post.save()
            res.status(200).json({
                success:true,
                message:"comment success"
            })
        }else{
            post.comments.push({
                user:req.User._id,
                comment:req.body.comment
            })
            await post.save()
            res.status(200).json({
                success:true,
                message:"comment upate"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


//delte comment

exports.deleteComment = async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            res.status(404).json({
                success:false,
                message:"post not found"
            })
        }
        if(post.owner.toString() === req.User._id.toString()){

            post.comments.forEach((item, index)=>{
                if(item._id.toString() === req.body.commentId.toString()){
                   return post.comments.splice(index, 1);
                }
            })
            await post.save()
            res.status(200).json({
                success:true,
                message:"select Comment delete"
            })

        }else{
            post.comments.forEach((item, index)=>{
                if(item.user.toString() === req.User._id.toString()){
                   return post.comments.splice(index, 1);
                }
            })
            await post.save()
            res.status(200).json({
                success:true,
                message:"comment delete hahah"
            })
        }
       
    } catch (error) {
        return res.status(500).json({
            success:true,
            message:error.message
        })
    }
}












