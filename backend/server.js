const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');

const Data = require('./data');

// express
const API_PORT = 3001;
const app = express();
//  路由
const router = express.Router();

// 连接数据库等相关
const dbRouter =
  'mongodb+srv://admin:admin@cluster0.2yv5h.mongodb.net/myFirstDatabase';
mongoose.connect(dbRouter, { useNewUrlParser: true });
let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
// 检测是否连接成功
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// 转换为可读的json格式
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 开启日志
app.use(logger('dev'));

// 获取数据的方法
// 用于获取数据库中所有可用数据
router.get('/getData', (req, res) => {
  Data.find((err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// 数据更新方法
// 用于对数据库中已有数据的更新
router.post('/updateData', (req, res) => {
  const { id, update } = req.body;
  Data.findOneAndUpdate(id, update, (err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// 删除数据方法
// 用于删除数据库中已有数据
router.delete('/deleteData', (req, res) => {
  const { id } = req.body;
  Data.findOneAndDelete(id, (err) => {
    if (err) return res.send(err);
    return res.json({ success: true });
  });
});

// 添加数据的方法
// 用于在数据库中添加数据
router.post('/putData', (req, res) => {
  let data = new Data();
  const { id, message } = req.body;
  if ((!id && id !== 0) || !message) {
    return res.json({
      success: false,
      error: 'INVALID INPUTS',
    });
  }
  data.message = message;
  data.id = id;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// 对http请求增加/api路由
app.use('/api', router);
// 开启端口
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
