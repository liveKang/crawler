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


var CrawlerDA = function(){};
module.exports = new CrawlerDA();
