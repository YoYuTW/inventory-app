const Item = require('../model/item');
const Category = require('../model/category');
const Branch = require('../model/branch');
const { body,validationResult } = require('express-validator');

exports.itemList = (req, res, next) => {
  try {
    const category = Category.find().exec();
    const items = Item.find().sort({'price': -1}).populate('category').exec();
    Promise.all([category, items]).then(results => {
      const categories = [];
      const categoryNames = results[0].map(category => category.name);      
      results[0].forEach(category => {
        categories.push({category, items: []});
      });
      results[1].forEach(item => {
        const category = item.category;
        categories[categoryNames.indexOf(category.name)].items.push(item);
      });
      res.render('itemList', {
        title: 'Items',
        categories,
      });
    });
  } catch(err) {
    return next(err)
  }  
};

exports.itemDetail = (req, res, next) => {
  try {
    const branchs = Branch.find({}, 'name itemInStock').populate({
      path: 'itemInStock.item',
      populate: {
        path: 'category',
      } 
    }).exec();
    const items = Item.findById(req.params.id).populate('category').exec()
    Promise.all([branchs, items]).then(results => {
      if (results[1] === null) {
        const err = new Error('Item Not Found');
        err.status = 404;
        return next(err)
      }
      const itemNumberInBranch = [];
      results[0].forEach(branch => {
        const name = branch.name;
        const theItem = branch.itemInStock.filter(item => item.item.name === results[1].name);        
        itemNumberInBranch.push({ name, number: theItem.length === 0 ? 0 : theItem[0].number});
      });      
      res.render('itemDetail', {
        item: results[1],
        itemNumberInBranch,
      });
    });    
  } catch(err) {
    return next(err)
  }
};

exports.itemCreateGet = (req, res, next) => {
  try {
    Category.find().sort({ name: 'asc' }).exec().then(categories => {
      res.render('itemForm', {
        title: 'Create Item',
        categories,
      });
    });    
  } catch(err) {
    return next(err)
  }
};

exports.itemCreatePost = [
  body('itemName').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.')
    .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
  body('category', 'Category must not be empty').trim().isLength({ min: 1 }).escape(),
  body('price').trim().isInt({ min: 0 }).escape().withMessage('Price must be a positive Integer'),
  body('description', 'Description must not be empty').trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      const newItem = new Item({
        name: req.body.itemName,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        Category.find().sort({ name: 'asc' }).exec().then(categories => {
          res.render('itemForm', {
            title: 'Create Item',
            categories,
            item: newItem,
            errors: errors.array() 
          });
        });
        return
      } else {
        newItem.save().then(item => res.redirect(item.url));
      }
    } catch(err) {
      return next(err)
    }
  }
];

exports.itemUpdateGet = (req, res, next) => {
  try {
    const categories = Category.find().sort({ name: 'asc' }).exec();
    const theItem = Item.findById(req.params.id).exec();
    Promise.all([categories, theItem]).then(results => {
      res.render('itemForm', {
        title: 'Update Item',
        categories: results[0],
        item: results[1],
      });
    });    
  } catch(err) {
    return next(err)
  }
};

exports.itemUpdatePost = [
  body('itemName').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.')
    .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
  body('category', 'Category must not be empty').trim().isLength({ min: 1 }).escape(),
  body('price').trim().isInt({ min: 0 }).escape().withMessage('Price must be a positive Integer'),
  body('description', 'Description must not be empty').trim().isLength({ min: 1 }).escape(),
  (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      const item = new Item({
        name: req.body.itemName,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        _id: req.params.id,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('itemForm', {
          title: 'Update Item',
          item,
          errors: errors.array() 
        });
        return
      } else {
        Item.findByIdAndUpdate(req.params.id, item).then(item => res.redirect(item.url));
      }
    } catch(err) {
      return next(err)
    }
  }
];

// Display Item delete form on GET.
exports.itemDeleteGet = (req, res, next) => {
  try {
    Item.findById(req.params.id).exec().then(item => {
      if (item === null) {
        res.redirect('/categories/items');
      }
      res.render('itemDelete', {
        title: 'Delete Item',
        item
      });
    });
  } catch(err) {
    return next(err)
  }
};

exports.itemDeletePost = (req, res, next) => {
  try {
    Item.findByIdAndDelete(req.body.itemid).exec().then(() => res.redirect('/categories/items'));
  } catch(err) {
    return next(err)
  }
};