const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branchController');
const categoryController = require('../controllers/categoryController');
const itemController = require('../controllers/itemController');

// GET request to get all categories
router.get('/', categoryController.categoryList);

// GET request to get all items.
router.get('/items', itemController.itemList);

// GET request to get a create form for items.
router.get('/items/create', itemController.itemCreateGet);

// POST request to create an item.
router.post('/items/create', itemController.itemCreatePost);

// GET request to get an item.
router.get('/items/:id', itemController.itemDetail);

// GET request to get update form for the item.
router.get('/items/:id/update', itemController.itemUpdateGet);

// POST request to update the item.
router.post('/items/:id/update', itemController.itemUpdatePost);

// GET request to get delete form for the item.
router.get('/items/:id/delete', itemController.itemDeleteGet);

// POST request to delete the item.
router.post('/items/:id/delete', itemController.itemDeletePost);

// GET request to get a create form for categories.
router.get('/create', categoryController.categoryCreateGet);

// POST request to create a category.
router.post('/create', categoryController.categoryCreatePost);

// GET request to get a category.
router.get('/:id', categoryController.categoryDetail);

// GET request to get update form for the category.
router.get('/:id/update', categoryController.categoryUpdateGet);

// POST request to update the category.
router.post('/:id/update', categoryController.categoryUpdatePost);

// GET request to get delete form for the category.
router.get('/:id/delete', categoryController.categoryDeleteGet);

// POST request to delete the category
router.post('/:id/delete', categoryController.categoryDeletePost);

module.exports = router;