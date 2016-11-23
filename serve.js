var express = require('express');
var url = require('url');    //解析操作URL
var superagent = require('superagent'); //客户端请求代理模块
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var async = require('async');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
var Crawler = mongoose.model('Crawler', crawlerSchema);

var content = new Crawler({
  title : "国外那些走心的设计，太牛了！",
  href : "http://www.jianshu.com/p/1a0d45756717",
  author : "鑫立方",
  finishTime : "2016.11.23 09:21"
});

console.log(content);

/*
crawler url
 */
var targetUrl = 'http://www.jianshu.com/';

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection erroe:'));
db.once('open', function() {
  console.log("db has been opened");
})

var app = express();

app.get('/',function (req, res, next){
  superagent.get(targetUrl)
      .end(function (err, sres) {
          var topicUrls = [];
          if (err) {
              return console.error(err);
          }

          var $ = cheerio.load(sres.text);
          // 获取首页所有的链接
          $('#list-container .title a').each(function(index,element) {
            var $element = $(element);
            var href = url.resolve(targetUrl, $element.attr('href'));
              topicUrls.push(href);
          });

          var ep = new eventproxy;
          ep.after('topic_html',topicUrls.length,function(topics){
            topics = topics.map(function(topicPair){
              var topicUrl = topicPair[0];
              var topicHtml = topicPair[1];

              var $ = cheerio.load(topicHtml);
              return({
                title: $('.preview .title').text().trim(),
                href: topicUrl,
                author: $('.preview .author-name span').text().trim(),
                finishTime: $('.preview .author-info span').eq(3).text().trim()
              });
            });
            // res.send(topics);
          });
          topicUrls.forEach(function(topicUrl){
            superagent.get(topicUrl)
              .end(function(err, res){
                ep.emit('topic_html',[topicUrl,res.text])
              });
          });

      });
});

app.listen(3000, function (req, res) {
  console.log('app is running at port 3000');
});
