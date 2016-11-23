var mongodb = require('./mongodb');
var Schema = mongodb.mongoose.Schema;

/*
define schema
 */
var crawlerSchema = new Schema({
  title:  String,
  href:   String,
  author: String,
  finishTime: { type: Date, default: Date.now }
});

/*
create a model
 */
var Crawler = mongodb.mongoose.model('Crawler', crawlerSchema);

// var content = new Crawler({
//   title : "国外那些走心的设计，太牛了！",
//   href : "http://www.jianshu.com/p/1a0d45756717",
//   author : "鑫立方",
//   finishTime : "2016.11.23 09:21"
// });

var CrawlerDA = function(){};
module.exports = new CrawlerDA();
