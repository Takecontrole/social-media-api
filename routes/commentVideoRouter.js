const router = require('express').Router()
const commentVideoCtrl = require('../controllers/commentVideoCtrl')
const auth = require('../middleware/auth')

router.post('/commentvideo', auth, commentVideoCtrl.createComment)

router.patch('/commentvideo/:id', auth, commentVideoCtrl.updateComment)

router.patch('/commentvideo/:id/like', auth, commentVideoCtrl.likeComment)

router.patch('/commentvideo/:id/unlike', auth, commentVideoCtrl.unLikeComment)

router.delete('/commentvideo/:id', auth, commentVideoCtrl.deleteComment)



module.exports = router