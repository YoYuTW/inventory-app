var express = require('express');
var router = express.Router();
const branchController = require('../controllers/branchController');

/* GET home page. */
router.get('/branch', branchController.index);

router.get('/branch/create', branchController.branchCreateGet);

router.post('/branch/create', branchController.branchCreatePost);

router.get('/branch/:id', branchController.branchDetail);

router.get('/branch/:id/inventory', branchController.branchInventoryGet);

router.post('/branch/:id/inventory', branchController.branchInventoryPost);

router.get('/branch/:id/update', branchController.branchUpdateGet);

router.post('/branch/:id/update', branchController.branchUpdatePost);

router.get('/branch/:id/delete', branchController.branchDeleteGet);

router.post('/branch/:id/delete', branchController.branchDeletePost);

router.get('/', (req, res) => res.redirect('/branch'));

module.exports = router;
