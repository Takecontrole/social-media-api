const Photos = require('../models/photoModel')
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

const photoCtrl = { 
  searchPhoto: async (req, res) => {
        try {
            const photos = await Photos.find({content: {$regex: req.query.content}})
            .limit(10).select("content images likes comments user createdAt")
             .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })
            res.json({photos})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    createPhoto: async (req, res) => {
        try {
            const { content, images } = req.body

            if(images.length === 0)
            return res.status(400).json({msg: "Please add your photo."})

            const newPhoto = new Photos({
                content, images, user: req.user._id
            })
            await newPhoto.save()

            res.json({
                msg: 'Создано !',
                newPhoto: {
                    ...newPhoto._doc,
                    user: req.user
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPhotos: async (req, res) => {
        try {
            const features =  new APIfeatures(Photos.find({
                //user: [...req.user.following, req.user._id]
            }), req.query).paginating()

            const photos = await features.query.sort('-createdAt')
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
                result: photos.length,
                photos
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updatePhoto: async (req, res) => {
        try {
            const { content, images } = req.body

            const photo = await Photos.findOneAndUpdate({_id: req.params.id}, {
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
                msg: "Updated!",
                newPhoto: {
                    ...photo._doc,
                    content, images
                }
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    likePhoto: async (req, res) => {
        try {
            const photo = await Photos.find({_id: req.params.id, likes: req.user._id})
            if(photo.length > 0) return res.status(400).json({msg: "Лайкнуто."})

            const like = await Photos.findOneAndUpdate({_id: req.params.id}, {
                $push: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This ph does not exist.'})

            res.json({msg: 'Лайк !'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unLikePhoto: async (req, res) => {
        try {

            const like = await Photos.findOneAndUpdate({_id: req.params.id}, {
                $pull: {likes: req.user._id}
            }, {new: true})

            if(!like) return res.status(400).json({msg: 'This ph does not exist.'})

            res.json({msg: 'Убран !'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getUserPhotos: async (req, res) => {
        try {
            const features = new APIfeatures(Photos.find({user: req.params.id}), req.query)
            .paginating()
            const photos = await features.query.sort("-createdAt")    

   .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })
            
            res.json({
                photos,
                result: photos.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getPhoto: async (req, res) => {
        try {
            const photo = await Photos.findById(req.params.id)
            .populate("user likes", "avatar username fullname followers")
            .populate({
                path: "comments",
                populate: {
                    path: "user likes",
                    select: "-password"
                }
            })

            if(!photo) return res.status(400).json({msg: 'This photo does not exist.'})

            res.json({
                photo
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    deletePhoto: async (req, res) => {
        try {
            const photo = await Photos.findOneAndDelete({_id: req.params.id, user: req.user._id})
            await Comments.deleteMany({_id: {$in: photo.comments }})

            res.json({
                msg: 'Удален !',
                newPhoto: {
                    ...photo,
                    user: req.user
                }
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    savePhoto: async (req, res) => {
        try {
            const user = await Users.find({_id: req.user._id, saved: req.params.id})
            if(user.length > 0) return res.status(400).json({msg: "You saved this photo."})

            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $push: {saved: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'Saved photo!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    unSavePhoto: async (req, res) => {
        try {
            const save = await Users.findOneAndUpdate({_id: req.user._id}, {
                $pull: {saved: req.params.id}
            }, {new: true})

            if(!save) return res.status(400).json({msg: 'This user does not exist.'})

            res.json({msg: 'unSaved photo!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getSavePhotos: async (req, res) => {
        try {
            const features = new APIfeatures(Photos.find({
                _id: {$in: req.user.saved}
            }), req.query).paginating()

            const savePhotos = await features.query.sort("-createdAt")            .populate("user likes", "avatar username fullname followers")

            res.json({
                savePhotos,
                result: savePhotos.length
            })

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
}

module.exports = photoCtrl