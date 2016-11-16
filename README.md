
###建立项目
* 搭建nodeJS环境。
* 建立一个Express项目，在空文件夹下`npm install superagent cheerio eventproxy async`。
* 也可以直接运行package.json文件。

###目标网站分析
如图，这是简书首页一部分div标签，可以通过id、class来定位需要获取的信息。

![jianshu](http://i2.buimg.com/5ab3564dc3824933.png)

###使用superagent获取源数据
SuperAgent 是一个轻量的Ajax API，服务器端（Node.js）客户端（浏览器端）均可使用,SuperAgent具有学习曲线低、使用简单、可读性好的特点,可作为客户端请求代理模块使用，当你想处理get,post,put,delete,head请求时，可以考虑使用SuperAgent

###使用cheerio解析
cheerio充当服务器端的jQuery功能，我们先使用它的.load()来载入HTML，再通过CSS selector来筛选元素。

###使用eventproxy来并发抓取
深度嵌套，eventproxy就是使用事件(并行)方法来解决这个问题。当所有的抓取完成后，eventproxy接收到事件消息自动帮你调用处理函数。

###async控制并发的速度
使用async的原因是，在实践的过程中，发现在并发获取所需内容的，有些数据不能被抓取过来，而真实的数据是有的，通过资料查找后，发现是网站的反爬虫机制，所以就想到了一个能控制并发速度的模块，当然也有更好的解决办法：动态IP。就是代价会高些。

###源码
<pre>
var express = require('express');
var url = require('url');                //解析操作URL
var superagent = require('superagent');  //获取源数据
var cheerio = require('cheerio');        //解析html代码
var eventproxy = require('eventproxy');  //并发抓取
var async = require('async');            //控制并发频率
var targetUrl = 'http://www.jianshu.com/';

var app = express();

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
          // console.log(topicUrls);
          // res.send(topicUrls);

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
            console.log(topics);
            res.send(topics);
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
</pre>

###抓取数据截图
![pachongtu](http://i2.buimg.com/0942549ac195d52e.png)

###参考资料
* ![http://www.codesec.net/view/183926.html](http://www.codesec.net/view/183926.html)
* ![http://cnodejs.org/topic/5203a71844e76d216a727d2e](http://cnodejs.org/topic/5203a71844e76d216a727d2e)
* ![https://www.npmjs.com/package/eventproxy](https://www.npmjs.com/package/eventproxy)

###遗留问题
* 控制爬虫并发，规避反爬虫机制

###提升
* 模拟用户登录，爬取多页面数据
