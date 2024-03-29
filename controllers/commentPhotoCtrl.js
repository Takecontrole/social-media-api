const Comments = require('../models/commentModel')
const Photos = require('../models/photoModel')


const commentPhotoCtrl = {
    createComment: async (req, res) => {
        try {
            const { photoId, content, tag, reply, photoUserId } = req.body

            const photo = await Photos.findById(photoId)
            if(!photo) return res.status(400).json({msg: "This видео does not exist."})

            if(reply){
                const cm = await Comments.findById(reply)
                if(!cm) return res.status(400).json({msg: "This коммент does not exist."})
            }

            const newComment = new Comments({
                user: req.user._id, content, tag, reply, photoUserId, photoId
            })

            await Photos.findOneAndUpdate({_id: photoId}, {
                $push: {comments: newComment._id}
            }, {new: true})

            await newComment.save()

            res.json({newComment})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateComment: async (req, res) => {
        try {
            const { content } = req.body
            
            await Comments.findOneAndUpdate({
                _id: req.params.id, user: req.user._id
            }, {content})

            res.json({msg: 'Успешно обновлено!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    likeComment: async (req, res) => {
        try {
            const comment = await Comments.find({_id: req.params.id, likes: req.user._id})
            if(comment.length > 0) return res.status(400).json({msg: "Уже лайнули!"})

            await Comments.findOneAndUpdate({_id: req.params.id}, {
                $push: {likes: req.user._id}
            }, {new: true})

            res.json({msg: 'Лайк!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unLikeComment: async (req, res) => {
        try {

            await Comments.findOneAndUpdate({_id: req.params.id}, {
                $pull: {likes: req.user._id}
            }, {new: true})

            res.json({msg: 'Лайк снят!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteComment: async (req, res) => {
        try {
            const comment = await Comments.findOneAndDelete({
                _id: req.params.id,
                $or: [
                    {user: req.user._id},
                    {photoUserId: req.user._id}
                ]
            })

            await Photos.findOneAndUpdate({_id: comment.photoId}, {
                $pull: {comments: req.params.id}
            })

            res.json({msg: 'Коммент удалён!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}


module.exports = commentPhotoCtrl