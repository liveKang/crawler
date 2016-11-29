var fs = require('fs');
var express = require('express');
var url = require('url');    //解析操作URL
var superagent = require('superagent'); //客户端请求代理模块
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var async = require('async');
var mongoose = require('mongoose');

var app = express();

var mongourl = 'mongodb://localhost/test1';
var targetUrl = 'http://www.jianshu.com/';

mongoose.connect(mongourl);
var Schema = mongoose.Schema;   //骨架模版

/*
define schema
*/
var crawlerSchema = new Schema({
    title:  String,
    href:   String,
    author: String,
    finishTime: { type: Date, default: Date.now }
});

var Crawler = mongoose.model('Crawler', crawlerSchema);//存储数据

app.get('/',function (req, res, next){
    superagent.get(targetUrl)
    .end(function (err, sres) {
        var topicUrls = [];
        if (err) {
            return console.error(err);
        }
        // console.log(sres.text);
        var $ = cheerio.load(sres.text);
        // 通过CSS selector来筛选数据，获取首页所有的链接
        $('#list-container .title a').each(function(index,element) {
            var $element = $(element);
            var href = url.resolve(targetUrl, $element.attr('href'));   //补全url地址
            topicUrls.push(href);
        });

        var ep = new eventproxy;
        //定义监听回调函数
        //after方法为重复监听
        //params: eventname(String) 事件名,times(Number) 监听次数, callback 回调函数
        ep.after('topic_html',topicUrls.length,function(topics){
            topics = topics.map(function(topicPair){
                var topicUrl = topicPair[0];
                var topicHtml = topicPair[1];

                var $ = cheerio.load(topicHtml);
                return({
                    title: $('.preview .title').text().trim(),                      //标题
                    href: topicUrl,                                                 //文章链接
                    author: $('.preview .author-name span').text().trim(),          //作者
                    finishTime: $('.preview .author-info span').eq(3).text().trim() //发表时间
                });
            });

            var docs = topics;
            Crawler.collection.insert(docs, onInsert);

            function onInsert(err,docs) {
                if (err) {
                    console.log("save fail");
                } else {
                    console.info('%d potatoes were successfully stored.', docs.length);
                }
            }

            res.send(topics);
        });

        //深度爬虫
        topicUrls.forEach(function(topicUrl){
            superagent.get(topicUrl)
            .end(function(err, res){
                ep.emit('topic_html',[topicUrl,res.text]);
            });
        });
    });
});

app.listen(3000, function (req, res) {
    console.log('app is running at port 3000');
});

// var http = require('http'),
// superagent = require('superagent'),
// cheerio = require('cheerio'),
// mongoose = require('mongoose'),
// mongourl = 'mongodb://localhost/mydb2',
// pageUrls = [],
// pageNum = 15;
// for(var i = 1; i <= pageNum; i++){
//     pageUrls.push('http://www.75team.com/post/?page='+i)
// }
// mongoose.connect(mongourl);
// var Schema = mongoose.Schema;//骨架模版
// var movieSchema = new Schema({
//     ahref : String
// })//模型
// var Movie = mongoose.model('Movie', movieSchema);//存储数据
// pageUrls.forEach(function(pageUrl){
//     superagent.get(pageUrl)
//     .end(function(err,page){
//         var $ = cheerio.load(page.text);
//         var quoteUrls = $('.entry-content blockquote a');
//         for(var i = 0;i < quoteUrls.length; i++){
//             var articalUrl ='{ahref:"'+ quoteUrls.eq(i).attr("href") +'"},';
//             var moive = new Movie({
//                 ahref : articalUrl
//             })            //保存数据库
//             moive.save(function(err) {
//                 if (err) {
//                     console.log('保存失败')
//                     return;
//                 }
//                 console.log('meow');
//             })
//         }
//     })
// })
