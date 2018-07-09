const superagent = require('superagent');
const cheerio = require('cheerio');
const async = require('async');
const url = require('url');

let cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl).end((err, res) => {
    if (err) return console.error(err);
    // 存放标题url的数组
    let topicUrls = [];
    let $ = cheerio.load(res.text);
    //获取首页所有的链接
    $('#topic_list .topic_title').each((idx, el) => {
        if (idx < 40) {
            let $el = $(el);
            let href = url.resolve(cnodeUrl, $el.attr('href'));
            topicUrls.push(href);
        }
    });
    //并发连接数的计数器
    let concurrencyCount = 0;
    let fetch = (url, callback) => {
        console.time('  耗时');
        concurrencyCount++;
        superagent.get(url).end((err, res) => {
            console.log('并发数:', concurrencyCount--, 'fetch', url);
            //let $ = cheerio.load(res.text);
            callback(null, [url, res.text]);
        });

    }
    async.mapLimit(topicUrls, 11, (topicUrl, callback) => {
        fetch(topicUrl, callback);
        console.timeEnd("  耗时");
    }, (err, result) => {
        result = result.map((pair) => {
            let $ = cheerio.load(pair[1]);
            return ({
                title: $('.topic_full_title').text().trim(),
                href: pair[0],
                comment1: $('.reply_content').eq(0).text().trim(),
                author1: $('.reply_author').eq(0).text().trim() || "评论不存在",
            });
        });
        console.log('final:\n', result);
    });
});