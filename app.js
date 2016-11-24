var fs = require('fs');
var express = require('express');
var url = require('url');    //解析操作URL
var superagent = require('superagent'); //客户端请求代理模块
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var async = require('async');

var dbtxt = '/home/xiaoang/git/web/site/static/data/article1.txt';
var articalUrls = [];
var pageUrls = [];
var pageNum = 15;

for(var i = 1; i <= pageNum; i++){
  pageUrls.push('http://www.***.com/post/?page='+i);
}
pageUrls.forEach(function(pageUrl,j){
  superagent.get(pageUrl)
  .end(function(err,page){
    var $ = cheerio.load(page.text);
    var quoteUrls = $('.entry-content blockquote a');
    for(var i = 0;i < quoteUrls.length; i++){
      var articalUrl ='{ahref:"'+ quoteUrls.eq(i).attr("href") +'"},';
      fs.writeFile(dbtxt, articalUrl,{'flag':'a'}, function (err) {
        if (err) throw err;
      })
    }
    if(j == 14) {
      console.log('It is saved!');
    }
  })
})

function onRequest(req,res){
  res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
  pageUrls.forEach(function(pageUrl,j)
  {
    superagent.get(pageUrl)
    .end(function(err,page){
      var $ = cheerio.load(page.text);
      var quoteUrls = $('.entry-content blockquote a');
      for(var i = 0;i < quoteUrls.length; i++){
        var articalUrl = quoteUrls.eq(i).attr('href');
        articalUrls.push(articalUrl);
      }
      if(j == 14){
        res.write('<img src="http://img.zcool.cn/community/01013d56ebaea86ac7257d204ec3c8.gif"/><br/>请等待，数据汇总中');
        setTimeout(function(){
          res.end(JSON.stringify(articalUrls));
        },5000)

      }
    })
  })
}


/*
fs.readFile(dbtxt, 'utf-8', function(err, data) {
  if (err)
  {
    throw err;
  }
  console.log(data);});
  */

  /*
  crawler url
  */
  var targetUrl = 'http://www.jianshu.com/';

  for(var i = 1; i <= pageNum; i++){
    pageUrls.push('http://www.**.com/post/?page='+i)
  }

  for(var i = 0;i < quoteUrls.length; i++){
    var articalUrl ='{ahref:"'+ quoteUrls.eq(i).attr("href") +'"},';
    var moive = new Movie({
      ahref : articalUrl
    })
    //保存数据库
    moive.save(function(err) {
      if (err) {
        console.log('保存失败')
        return;
      }
      console.log('meow');
    })
  }


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
