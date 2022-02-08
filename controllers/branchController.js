const Branch = require('../model/branch');
const Category = require('../model/category');
const Item = require('../model/item');
const { body,validationResult } = require('express-validator');

exports.index = async (req, res) => {
  try {
    const getBranches = await Branch.find({}, 'name itemInStock').populate({
      path: 'itemInStock.item',
      populate: {
        path: 'category',
      } 
    });
    const branches = [];

    getBranches.forEach(branch => {
      const name = branch.name;
      const count = [];
      const url = branch.url;
      branch.itemInStock.forEach(element => {
        const categoryName = element.item.category.name;
        const numberInStock = element.number;
        const names = count.map(e => e.categoryName);
        const id = names.indexOf(categoryName);
        if (id > -1) { // The category has been added into count
          count[id].numberInStock += numberInStock;
        } else {
          // The category has not been added, create new one
          count.push({ categoryName, numberInStock });  
        }                    
      });
      branches.push({name, count, url});
    });

    res.render('index', {
      title: 'I-KE-A',
      branches,
    });
  } catch(error) {
    res.render('error', { error });
  }
};

exports.branchDetail = (req, res, next) => {
  try {
    const category = Category.find().exec();
    const items = Item.find().sort({'price': -1}).populate('category').exec();
    const branch = Branch.findById(req.params.id).populate({
      path: 'itemInStock.item',
      populate: {
        path: 'category',
      } 
    }).sort({ category: 'asc' }).exec();
    Promise.all([category, items, branch]).then(results => {      
      const itemNames = results[2].itemInStock.map(element => element.item.name);
      const itemsInStock = [];
      const categoryNames = results[0].map(category => category.name);      
      results[0].forEach(category => {
        itemsInStock.push({category, items: []});
      });
      results[1].forEach(item => {
        const index = itemNames.indexOf(item.name);
        let number;
        if (index === -1) {
          number = 0;
        } else {
          number = results[2].itemInStock[index].number;
        }      
        item.numberInStock = number;
        const category = item.category;
        itemsInStock[categoryNames.indexOf(category.name)].items.push(item);
      });
      res.render('branchDetail', {      
        branch: results[2],
        inStock: itemsInStock,
      });
    });
  } catch(err) {
    return next(err)
  }
};

exports.branchCreateGet = (req, res, next) => {
  try {
    res.render('branchForm',{
      title: 'Create Branch'
    });
  } catch(err) {
    return next(err)
  }
};

exports.branchCreatePost = [
  body('branchName').trim().isLength({ min:1, max: 100 }).escape().withMessage('Name must br specify.')
    .isAlpha('en-US', {ignore: '\s'}).withMessage('Name has non-alpha characters.'),
  body('address').trim().isLength({ min:1 }).escape().withMessage("Address must not be empty"),
  body('email').isEmail().withMessage("Invalid email").normalizeEmail(),
  body('telephone', "Invalid phone number.").trim().escape(),

  (req, res, next) => {
    try {
      const errors = validationResult(req);
      const newBranch = new Branch({
        name: req.body.branchName,
        address: req.body.address,
        email: req.body.email,
        telephone: req.body.telephone,
        itemInStock: [],
      });

      if (!errors.isEmpty()) {
        res.render('branchForm', {
          title: 'Create Branch',
          branch: newBranch,
          errors: errors.array(),
        });
        return
      } else {
        newBranch.save().then(branch => res.redirect(branch.url));
      }
    } catch(err) {
      return next(err)
    }
  }
];

exports.branchInventoryGet = (req, res, next) => {
  try {
    const category = Category.find().exec();
    const items = Item.find().sort({'price': -1}).populate('category').exec();
    const branch = Branch.findById(req.params.id).populate({
      path: 'itemInStock.item',
      populate: {
        path: 'category',
      } 
    }).sort({ category: 'asc' }).exec();
    Promise.all([category, items, branch]).then(results => {      
      const itemsInStock = filterCategories(results);
      res.render('branchInventoryManage', {   
        title: 'Manage Inventory',   
        branch: results[2],
        inStock: itemsInStock,
      });
    });
  } catch(err) {
    return next(err)
  }
};

exports.branchInventoryPost = [  
  body().custom((value, { req }) => {
    for (const value of Object.values(req.body)) {
      const quantity = parseInt(value, 10);
      if (Object.is(quantity, NaN) || quantity < 0 || quantity > 99) {  
        throw new Error('Inventory must be an integer from 0 to 99.')
      }
    }
    return true
  }),

  async (req, res, next) => {
    try {      
      const errors = validationResult(req);
      const newQuantity = [];
      const inputs = Object.assign(req.body);      
      for (const [key, value] of Object.entries(inputs)) {
        const item = await Item.findById(key).exec();
        if (item === null) {
          continue
        }
        const quantity = parseInt(value, 10);
        newQuantity.push({ item, number: quantity });        
      };      

      if (!errors.isEmpty()) {
        const category = Category.find().exec();
        const items = Item.find().sort({'price': -1}).populate('category').exec();
        const branch = Branch.findById(req.params.id).populate({
          path: 'itemInStock.item',
          populate: {
            path: 'category',
          } 
        }).sort({ category: 'asc' }).exec();
        Promise.all([category, items, branch]).then(results => {
          const inStock = filterCategories(results);
          res.render('branchInventoryManage', {
            title: 'Manage Inventory',
            branch: results[2],          
            inStock,
            errors: errors.array(),
          });
        });        
      } else {
        Branch.findByIdAndUpdate(req.params.id, { itemInStock: newQuantity }).exec().then(branch => res.redirect(branch.url));    
      }            
    } catch(err) {
      return next(err)
    }
  }
];

function filterCategories([categories, items, branch]) {
  const itemNames = branch.itemInStock.map(element => element.item.name);
  const itemsInStock = [];
  const categoryNames = categories.map(category => category.name);      
  categories.forEach(category => {
    itemsInStock.push({category, items: []});
  });
  items.forEach(item => {
    const index = itemNames.indexOf(item.name);
    let number;
    if (index === -1) {
      number = 0;
    } else {
      number = branch.itemInStock[index].number;
    }      
    item.numberInStock = number;
    const category = item.category;
    itemsInStock[categoryNames.indexOf(category.name)].items.push(item);
  });
  return itemsInStock
};

exports.branchUpdateGet = (req, res, next) => {
  try { 
    Branch.findById(req.params.id).exec().then(branch => {
      res.render('branchForm', {
        title: 'Update Branch',
        branch,
      });      
    });
  } catch(err) {
    return next(err)
  }
};

exports.branchUpdatePost = [
  body('branchName').trim().isLength({ min:1, max: 100 }).escape().withMessage('Name must br specify.')
    .isAlpha('en-US', {ignore: '\s'}).withMessage('Name has non-alpha characters.'),
  body('address').trim().isLength({ min:1 }).escape().withMessage("Address must not be empty"),
  body('email').isEmail().withMessage("Invalid email").normalizeEmail(),
  body('telephone', "Invalid phone number.").trim().escape(),

  (req, res, next) => {
    try {
      const errors = validationResult(req);
      const branch = {
        name: req.body.branchName,
        address: req.body.address,
        email: req.body.email,
        telephone: req.body.telephone,
      }

      if (!errors.isEmpty()) {
        res.render('branchForm', {
          title: 'Update Branch',
          branch,
          errors: errors.array(),
        });           
        return       
      } else {
        Branch.findByIdAndUpdate(req.params.id, branch).exec().then(branch => res.redirect(branch.url));
      }
    } catch(err) {
      return next(err)
    }
  }
];

exports.branchDeleteGet = (req, res, next) => {
  try {
    Branch.findById(req.params.id).exec().then(branch => {
      if (branch === null) {
        res.redirect('/branch');
        return
      } else {
        res.render('branchDelete', {
          title: 'Delete Branch',
          branch
        });
      }
    });
  } catch(err) {
    return next(err)
  }
};

exports.branchDeletePost = (req, res, next) => {
  try {
    Branch.findByIdAndDelete(req.body.branchid).then(() => res.redirect('/branch'));
  } catch(err) {
    return next(err)
  }
}