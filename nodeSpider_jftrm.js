//这个脚本所需要的模块
const superagent = require('superagent');
const cheerio = require('cheerio');
const async = require('async');

//接口地址及参数，方式get
let cnodeUrl = 'https://jf.tairanmall.com/api/v1/credit/goods/category?scoreMin=&scoreMax=&orderByType=&pageIndex=1&pageSize=10';

superagent.get(cnodeUrl).end((err, res) => {
    if (err) return console.error(err);
    let imgUrls = [];   //用于存放所有图片的地址的容器
    for (let i in res.body.infos) {
        //将需要操作的数据转换成json格式
        let data=JSON.parse(res.body.infos[i].mediumImg)
        for (let j in data) {imgUrls.push(data[j].fileUrl)}
        //将所有的图片地址存放进imgUrls容器里
    }
    let concurrencyCount = 0;   //展示并发数量
    let fetch = (url, callback) => {    //每个异步操作中所做的操作（图片请求和保存我打算放在这里）
        console.time('  耗时');
        concurrencyCount++;
        superagent.get(url).end((err, res) => {
            console.log('并发数:', concurrencyCount--, 'fetch', url);
            callback(null, [url, res.text]);
        });
    }

    /* async.mapLimit(imgUrls, 5, (imgUrl, callback) => {
        fetch(imgUrl, callback);
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
    }); */
});