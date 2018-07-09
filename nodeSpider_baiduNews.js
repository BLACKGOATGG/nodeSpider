var express = require('express');   //服务
var cheerio = require('cheerio');
var superagent = require('superagent'); // 超级代理模块

var app = express();
app.get('/', function (req, res, next) {
    superagent.get('http://news.baidu.com/').end(function (err, sres) {
        if (err) return next(err);
        var $ = cheerio.load(sres.text);
        var arr = [];
        $(".ulist.focuslistnews").each(function (index, element) { //下面类似于jquery的操作，前端的小伙伴们肯定很熟悉啦
            var $eleItem = $(element).find('.bold-item a');
            var $eleItemSon = $(element).find('.bold-item ~ li a')
            arr.push({
                title: $eleItem.text(),
                href: $eleItem.attr('href'),
                item: {
                    title: $eleItemSon.text(),
                    href: $eleItemSon.attr('href')
                }
            });
        });
        res.send(arr);
    })
});
//抓取成功后访问8888端口查看结果
app.listen(8888, function () {
    console.log('抓取成功~~~');
});