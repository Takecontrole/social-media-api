const router = require('express').Router()
const commentPhotoCtrl = require('../controllers/commentPhotoCtrl')
const auth = require('../middleware/auth')

router.post('/commentphoto', auth, commentPhotoCtrl.createComment)

router.patch('/commentphoto/:id', auth, commentPhotoCtrl.updateComment)

router.patch('/commentphoto/:id/like', auth, commentPhotoCtrl.likeComment)

router.patch('/commentphoto/:id/unlike', auth, commentPhotoCtrl.unLikeComment)

router.delete('/commentphoto/:id', auth, commentPhotoCtrl.deleteComment)



module.exports = router