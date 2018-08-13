//node爬虫系列

const dependencies = {
  "async": "^2.6.1", //控制并发
  "cheerio": "^1.0.0-rc.2", //jQuery核心实现
  "express": "^4.16.3", //模块化
  "fs": "^0.0.1-security", //文件系统
  "iconv-lite": "^0.4.23", //转换字符编码
  "request": "^2.87.0", //请求
  "superagent": "^3.8.3", //超级代理
  "superagent-charset": "^1.2.0" //superagent的转码
}

/* 
  nodeSpider_async  （网络）爬取 https://cnodejs.org/ node论坛帖子 async.mapLimit并发
  nodeSpider_baiduNews  （网络）爬取 http://news.baidu.com/ 百度新闻 启动服务,抓取成功后访问8888端口查看结果
  nodeSpider_xwdu （网络）http://www.zwdu.com/book/8634/ 八一中文网 择天记 启动服务3378端口,正则去空格,正则Unicode转汉字,async.mapLimit并发

  nodeSpider_html 爬取html内容基础模板
  nodeSpider_api 爬取api内容基础模板
  nodeSpider_jftrm 爬取api内容,async.mapLimit并发,.pipe(fs.createWriteStream())保存图片
  node_spider 这有写这个时候我才觉得代码不负与我
*/