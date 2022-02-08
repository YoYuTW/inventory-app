#! /usr/bin/env node

console.log('This script populates some items, categories, branchs to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const Item = require('./model/item');
const Category = require('./model/category');
const Branch = require('./model/branch');

const items = [];
const categories = [];

const mongoose = require('mongoose');
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

async function itemCreate(name, description, category, price ) {
  try {
    const detail = {
      name,
      description,
      category,
      price,
    };
  
    const item = new Item(detail);

    await item.save().then(() => {
      console.log(`New item: ${item}`);
      items.push(item);
      return
    });  
  } catch(err) {
    console.error(err);
    return
  }  
};

async function categoryCreate(name, description) {
  try {
    const detail = {
      name,
      description,
    };
  
    const category = new Category(detail);

    await category.save().then(() => {
      console.log(`New item: ${category}`);
      categories.push(category);
      return
    });  
  } catch(err) {
    console.error(err);
    return 
  }  
};

async function branchCreate(name, address, email, telephone, itemInStock ) {
  try {
    const detail = {
      name,
      address,
      email,
      telephone,
      itemInStock,
    };
  
    const branch = new Branch(detail);

    await branch.save().then(() => {
      console.log(`New branch: ${branch}`);
      return branch
    });  
  } catch(err) {
    console.error(err);
    return
  }  
};

function createSamples() {
  const sofa = categoryCreate('sofa', '不只是漂亮而已 更舒適好坐');
  const table = categoryCreate('table', '每天都會用到的萬用桌');
  const cabinet = categoryCreate('cabinet', '好看又好收');
  const bed = categoryCreate('bed', '夜夜好眠的夢想床組');
  Promise.all([sofa, table, cabinet, bed]).then(() => {
    const GLOSTAD = itemCreate('GLOSTAD', 'GLOSTAD沙發能夠讓你輕鬆購買，容易拿回家組裝和使用', categories[0], 2799);
    const KIVIK = itemCreate('KIVIK', '座椅寬敞、柔軟又深，能給予背部舒適支撐', categories[0], 16900);
    const LANDSKRONA = itemCreate('LANDSKRONA', '溫暖、舒適、整潔又時尚', categories[0], 22900);
    const FARLOV = itemCreate('FÄRLÖV', '既是看電影的最佳夥伴，也是房間的展示品', categories[0], 26900);
    const LISABO = itemCreate('LISABO', '我們為LISABO系列感到驕傲，這個系列的經典設計獲得國際紅點設計大獎；產品堅固耐用、容易組裝，質感輕巧，具有手工質感', categories[1], 4999);
    const EKEDALEN = itemCreate('EKEDALEN', '經久耐用的餐桌，讓你輕鬆享受豐盛大餐；一個人就能延伸桌面，而且桌腳會隨著桌面移動，底下可放置更多座椅', categories[1], 7490);
    const GAMLARED = itemCreate('GAMLARED', '圓桌適合聚會、聊天使用；溫暖的木頭，柔和的圓形邊緣，可營造舒適、輕鬆的氛圍，適合放在家裡任何地方', categories[1], 2799);
    const HEMNES = itemCreate('HEMNES', '天然、可再生實心松木材質，經久使用後更顯美觀；附大抽屜，可整齊收納物品', categories[2], 8990);
    const BAGGEBO = itemCreate('BAGGEBO', '採用俐落線條設計，可輕鬆搭配居家現有佈置', categories[2], 479);
    const LAPPLAND = itemCreate('LAPPLAND', '專為電視愛好者而設計的棕黑色電視收納組合，能放置最大60吋的電視機。你可以自由選擇將層架放置左邊或右邊。有了它，隨時都可以欣賞你喜愛的電視節目', categories[2], 5995);
    const SLATTUM = itemCreate('SLATTUM', '柔軟表布內含軟墊，可為臥室營造舒適氛圍；床頭板可當作夜晚看書的舒適靠墊，且同一個包裝包含所有配件，讓你更容易帶回家', categories[3], 5990);
    const TUFJORD = itemCreate('TUFJORD', 'TUFJORD使你渴望睡覺，床頭板的環繞曲線可幫助你放鬆身心，更舒適', categories[3], 16900);
    Promise.all([GLOSTAD, KIVIK, LANDSKRONA, FARLOV, LISABO, EKEDALEN, GAMLARED, HEMNES, BAGGEBO, LAPPLAND, SLATTUM, TUFJORD]).then(results => {
      branchCreate('Neihu', '台北市114內湖區舊宗路一段128號1樓', 'serviceNHS@IKEA.com.tw', '(02)412-8869#1',
        createItemInStock(items, [2, 3, 3, 4, 1, 5, 6, 1, 0, 0, 3, 2]));
      branchCreate('Taichung', '台中市南屯區向上路二段168號', 'serviceTCS@IKEA.com.tw', '(02)412-8869#4',
        createItemInStock(items, [1, 0, 0, 0, 4, 3, 5, 19, 29, 0, 32, 4]));
    });    
  });
};

function createItemInStock(items, numbers) {
  return items.map((item, i) => {
    return {
      item,
      number: numbers[i]
    }
  });
};

createSamples();


