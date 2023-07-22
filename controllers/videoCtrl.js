const Videos = require('../models/videoModel')
const Comments = require('../models/commentModel')
const Users = require('../models/userModel')


class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}


const videoCtrl = { 
  searchVideo: async (req, res) => {
        try {
            const videos = await Videos.find({content: {$regex: req.query.content}})
            .limit(10).select("content images likes comments user createdAt")
             .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })
            res.json({videos})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    createVideo: async (req, res) => {
        try {
            const { content, images } = req.body

            if(images.length === 0)
            return res.status(400).json({msg: "Добавьте видео."})

            const newVideo = new Videos({
                content, images, user: req.user._id
            })
            await newVideo.save()

            res.json({
                msg: 'Создано!',
                newVideo: {
                    ...newVideo._doc,
                    user: req.user
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }, 
    getVideos: async (req, res) => {
        try {
            const features =  new APIfeatures(Videos.find({
               // user: [...req.user.following, req.user._id]
            }), req.query).paginating()

            const videos = await features.query.sort('-createdAt')
            .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            res.json({
                msg: 'Успешно!',
                result: videos.length,
                videos
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
 updateVideo: async (req, res) => {
        try {
            const { content, images } = req.body

            const video = await Videos.findOneAndUpdate({_id: req.params.id}, {
                content, images
            }).populate("user likes", "avatar username fullname")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            res.json({
                msg: "Видео обновлено!",
                newVideo: {
                    ...video._doc,
                    content, images
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getVideo: async (req, res) => {
        try {
            const video = await Videos.findById(req.params.id)
            .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            if(!video) return res.status(400).json({msg: 'Видео не существует.'})

            res.json({
                video
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deleteVideo: async (req, res) => {
        try {
            const video = await Videos.findOneAndDelete({_id: req.params.id, user: req.user._id})
            await Comments.deleteMany({_id: {$in: video.comments }})

            res.json({
                msg: 'Видео удаленно!',
                newVideo: {
                    ...video,
                   user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }, 
    getUserVideos: async (req, res) => {
        try {
            const features = new APIfeatures(Videos.find({user: req.params.id}), req.query)
            .paginating()
            const videos = await features.query.sort("-createdAt")    

   .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })
            
            res.json({
                videos,
                result: videos.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
        likeVideo: async (req, res) => {
        try {
            const video = await Videos.find({_id: req.params.id, likes: req.user._id})
            if(video.length > 0) return res.status(400).json({msg: "Вы лайкнули."})

           const like =
            await Videos.findOneAndUpdate({_id: req.params.id}, {
                $push: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This vid does not exist.'})

            res.json({msg: 'Лайк'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unLikeVideo: async (req, res) => {
        try {

            const like = 
            await Videos.findOneAndUpdate({_id: req.params.id}, {
                $pull: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This vid does not exist.'})

            res.json({msg: 'Лайк удалён'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
        saveVideo: async (req, res) => {
        try {
            const user = await Users.find({_id: req.user._id, savedVideo: req.params.id})
            if(user.length > 0) return res.status(400).json({msg: "You saved this post."})

            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $push: {savedVideo: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'Сохранено!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unSaveVideo: async (req, res) => {
        try {
            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {savedVideo: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'Удалено из закладок'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getSaveVideos: async (req, res) => {
        try {
            const features = new APIfeatures(Videos.find({
                _id: {$in: req.user.savedVideo}
            }), req.query).paginating()

            const saveVideos = await features.query.sort("-createdAt")            .populate("user likes", "avatar username fullname followers")

            res.json({
                saveVideos,
                result: saveVideos.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}

module.exports = videoCtrl