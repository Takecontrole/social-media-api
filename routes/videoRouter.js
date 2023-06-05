const router = require('express').Router()
const videoCtrl = require('../controllers/videoCtrl')
const auth = require('../middleware/auth')

router.get('/searchvideo', auth, videoCtrl.searchVideo)

router.route('/videos')
    .post(auth, videoCtrl.createVideo) 
    .get(videoCtrl.getVideos)
    
router.route('/video/:id')
    .patch(auth, videoCtrl.updateVideo)
    .get(auth, videoCtrl.getVideo)
    .delete(auth, videoCtrl.deleteVideo)
    
router.patch('/video/:id/like', auth, videoCtrl.likeVideo)

router.patch('/video/:id/unlike', auth, videoCtrl.unLikeVideo) 

router.get('/user_videos/:id', videoCtrl.getUserVideos)

router.patch('/saveVideo/:id', auth, videoCtrl.saveVideo)

router.patch('/unSaveVideo/:id', auth, videoCtrl.unSaveVideo)

router.get('/getSaveVideos', auth, videoCtrl.getSaveVideos)
module.exports = router