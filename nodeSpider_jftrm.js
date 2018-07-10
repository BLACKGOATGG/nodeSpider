//这个脚本所需要的模块
const superagent = require('superagent');
const async = require('async');
const request = require('request');
const fs = require('fs');

//接口地址及参数，方式get
let targetUrl = 'https://jf.tairanmall.com/api/v1/credit/goods/category?scoreMin=&scoreMax=&orderByType=&pageIndex=1&pageSize=50';

superagent.get(targetUrl).end((err, res) => {
    if (err) console.log(err);
    let concurrencyCount = 25;  //最大并发数量
    let concurrencyNum = 0; //用于展示当前并发数量
    let fileName = 1; //自定义图片名
    let imgUrls = []; //用于存放所有图片url的容器
    for (let i in res.body.infos) {
        //fs.mkdir('./images/'+res.body.infos[i].goodsName, (err)=>{ if(err) console.log(err)})
        //将需要操作的数据转换成json格式
        let data = JSON.parse(res.body.infos[i].mediumImg);
        for (let j in data) {imgUrls.push(data[j].fileUrl)}
        //将所有的图片地址存放进imgUrls容器里
    }
    let fetch = (url, callback) => {
        concurrencyNum++;
        console.time(`开启并发线程:${concurrencyNum} 目标:${url} 耗时`);
        request(url, (fetchErr, fetchRes) => {
            if (fetchErr) console.log(fetchErr);
            console.log(`目标${fileName} 请求完成，当前并发数量:${concurrencyNum}`);
        }).pipe(
            fs.createWriteStream(`./images/${fileName}.jpg`)
            .on('error', (fsErr)=>{console.log(fsErr.stack)})
            .on('finish', ()=> {
                console.log(`目标${fileName} 写入完成，线程关闭。`);
                fileName++;
                concurrencyNum--;
                callback(null, [url]);
            })
        );
    }
    console.log(`nodeSpider 最大开启线程${concurrencyCount},目标数量:${imgUrls.length}`);
    async.mapLimit(imgUrls, concurrencyCount, (imgUrl, callback) => {
        fetch(imgUrl, callback);
        console.timeEnd(`开启并发线程:${concurrencyNum} 目标:${imgUrl} 耗时`);
    }, (asyncErr, asyncRes) => {
        if (asyncErr) console.log(asyncErr);
        // console.log('final:\n', asyncRes);
        console.log(`任务完成。`)
    });
});