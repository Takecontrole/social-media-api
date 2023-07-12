const router = require('express').Router()
const photoCtrl = require('../controllers/photoCtrl')
const auth = require('../middleware/auth')

router.get('/searchphoto', auth, photoCtrl.searchPhoto)

router.route('/photos')
    .post(auth, photoCtrl.createPhoto)
    .get( photoCtrl.getPhotos)

router.route('/photo/:id')
    .patch(auth, photoCtrl.updatePhoto)
    .get(auth, photoCtrl.getPhoto)
    .delete(auth, photoCtrl.deletePhoto)

router.patch('/photo/:id/like', auth, photoCtrl.likePhoto)

router.patch('/photo/:id/unlike', auth, photoCtrl.unLikePhoto)

router.get('/user_photos/:id', photoCtrl.getUserPhotos)

router.patch('/savePhoto/:id', auth, photoCtrl.savePhoto)

router.patch('/unSavePhoto/:id', auth, photoCtrl.unSavePhoto)

router.get('/getSavePhotos', auth, photoCtrl.getSavePhotos)


module.exports = router