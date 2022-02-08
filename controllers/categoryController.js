const Category = require('../model/category');
const Item = require('../model/item');
const { body, validationResult } = require('express-validator');

exports.categoryList = (req, res, next) => {
  try {
    Category.find().exec().then(categories => {
      res.render('categoryList', {
        title: 'Current Category',
        categories,
      });      
    });
  } catch(err) {
    return next(err)
  }
};

exports.categoryDetail = (req, res, next) => {
  try {
    const category = Category.findById(req.params.id).exec();
    const items = Item.find({'category': req.params.id}).exec();
    Promise.all([category, items]).then(results => {
      // return error if no results
      if (results[0] === null) {
        const err = new Error('Category Not Found');
        err.status = 404;
        return next(err)
      }
      // Success, render the page
      res.render('categoryDetail', {
        category: results[0],
        items: results[1]
      });
    });
  } catch(err) {
    return next(err)
  }
};

exports.categoryCreateGet = (req, res, next) => {
  try {
    res.render('categoryForm', { 
      title: 'Create Category'
    });
  } catch(err) {
    return next(err)
  }
};

exports.categoryCreatePost = [
  body('categoryName').trim().isLength({ min: 1, max: 100 }).escape().withMessage('Name must be specified.')
    .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
  body('description').trim().isLength({ min: 1, max: 200 }).escape().withMessage('Description must not be empty.'),
  
  (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      const newCategory = new Category({
        name: req.body.categoryName,
        description: req.body.description,
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('categoryForm', {
          title: 'Create Category',
          category: newCategory,
          errors: errors.array() 
        });
        return

      } else { // Data from form is valid.
        Category.findOne({ 'name': req.body.categoryName }).exec().then(category => { 
          if (category) { // Redirect to the category if it already exists.
            res.redirect(category.url);
            return
          } else {
            newCategory.save().then(category => res.redirect(category.url));
          }
        });        
      }
    } catch(err) {
      return next(err)
    }
  }
];

exports.categoryUpdateGet = (req, res, next) => {
  try {
    Category.findById(req.params.id).exec().then(category => {
      res.render('categoryForm', {
        title: 'Update Category',
        category
      });
    });
  } catch(err) {
    return next(err)
  }
};

exports.categoryUpdatePost = [
  body('categoryName').trim().isLength({ min: 1, max: 100 }).escape().withMessage('Name must be specified.')
    .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
  body('description').trim().isLength({ min: 1, max: 200 }).escape().withMessage('Description must not be empty.'),

  (req, res, next) => {
    try {
      // Extract the validation errors from a request.
      const errors = validationResult(req);

      const category = new Category({
        name: req.body.categoryName,
        description: req.body.description,
        _id: req.params.id
      });

      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('categoryForm', {
          title: 'Update Category',
          category,
          errors: errors.array()
        });
        return
      } else {
        Category.findByIdAndUpdate(req.params.id, category).exec().then(category => res.redirect(category.url));
      }      
    } catch(err) {
      return next(err)
    }
  }
];

exports.categoryDeleteGet = (req, res, next) => {
  try {
    Category.findById(req.params.id).exec().then(category => {
      if (category === null) {
        res.redirect('/categories');
      } else {
        res.render('categoryDelete', {
          title: 'Delete Category',
          category
        });
      }
    })
  } catch(err) {
    return next(err)
  }
};

exports.categoryDeletePost = (req, res, next) => {
  try {
    Category.findByIdAndDelete(req.body.categoryid).exec().then(() => res.redirect('/categories'));
  } catch(err) {
    return next(err)
  }
};

