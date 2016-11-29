
###建立项目
* 搭建nodeJS环境。
* 建立一个Express项目，在空文件夹下`npm i`。
* 下载mongoDB，配置环境变量。

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

###使用mongoose将爬到的数据存储在mongoDB中
之前爬到的数据，并没有存储在数据库中，现增加存储方式。

###抓取数据截图
![pachongtu1](http://i1.piimg.com/567571/2f90a3db64f0ebd1.png)
![pachongtu2](http://i1.piimg.com/567571/b775342a667b0c88.png)


###提升
* 模拟用户登录，爬取多页面数据
* 数据库去重
