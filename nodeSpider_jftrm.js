//这个脚本所需要的模块
const request = require('request');
const superagent = require('superagent');
const async = require('async');
const fs = require('fs');

//接口地址及参数，方式get
let cnodeUrl = 'https://jf.tairanmall.com/api/v1/credit/goods/category?scoreMin=&scoreMax=&orderByType=&pageIndex=1&pageSize=30';
//最大并发数量
let concurrencyCount = 5;

superagent.get(cnodeUrl).end((err, res) => {
    if (err) console.log(err);
    let imgUrls = []; //用于存放所有图片url的容器
    for (let i in res.body.infos) {
        //fs.mkdir('./images/'+res.body.infos[i].goodsName, (err)=>{ if(err) console.log(err)})
        //将需要操作的数据转换成json格式
        let data = JSON.parse(res.body.infos[i].mediumImg);
        for (let j in data) {imgUrls.push(data[j].fileUrl)}
        //将所有的图片地址存放进imgUrls容器里
    }
    let concurrencyNum = 0; //用于展示当前并发数量
    let fetch = (url, callback) => {
        concurrencyNum++;
        console.time(`并发数:${concurrencyNum} 目标:${url} 耗时`);
        request(url, (fetchErr, fetchRes) => {
            if (fetchErr) return console.log(fetchErr);
            console.log(`并发数:${concurrencyNum} 目标:${url} OK`);
            concurrencyNum--;
        }).pipe(fs.createWriteStream(`./images/${concurrencyNum}.jpg`));
        callback(null, [url]);
    }
    async.mapLimit(imgUrls, concurrencyCount, (imgUrl, callback) => {
        fetch(imgUrl, callback);
        console.timeEnd(`并发数:${concurrencyNum} 目标:${imgUrl} 耗时`);
    }, (asyncErr, asyncRes) => {
        if (asyncErr) return console.log(asyncErr);
        console.log('final:\n', asyncRes);
    });
});