//这个脚本所需要的模块
const superagent = require('superagent');
const async = require('async');
const request = require('request');
const fs = require('fs');

//接口地址及参数，方式get
let targetUrl = 'https://jf.tairanmall.com/api/v1/credit/goods/category?scoreMin=&scoreMax=&orderByType=&pageIndex=1&pageSize=50';
let concurrencyCount = 1;  //最大并发数
superagent.get(targetUrl).end((err, res) => {
    if (err) console.log(err);
    let concurrencyNum = 0; //当前并发数
    let concurrencyNo = 0; //自定义线程名
    let fileNo = 1; //自定义img序号
    let fileName =undefined;
    let imgUrls = []; //用于存放所有图片url的容器
    for (let i in res.body.infos) {
        //将需要操作的数据转换成json格式
        let data = JSON.parse(res.body.infos[i].mediumImg);
        for (let j in data) {imgUrls.push(data[j].fileUrl)}
        //将所有的图片地址存放进imgUrls容器里
    }

    console.log(`nodeSpider 最大开启线程${concurrencyCount},目标数量:${imgUrls.length}`);
    async.mapLimit(imgUrls, concurrencyCount, (imgUrl, callback) => {
        concurrencyNum++;
        concurrencyNo++;
        console.time(`开启并发线程:${concurrencyNo} 目标:${imgUrl} 耗时`);
        console.time(`当前并发数量:${concurrencyNum} 目标${fileNo} 请求完成 请求耗时`);
        request(imgUrl, (fetchErr, fetchRes) => {
            if (fetchErr) console.log(fetchErr);
            fileName = imgUrl.slice(30); //自定义目标图片名
            console.timeEnd(`当前并发数量:${concurrencyNum} 目标${fileNo} 请求完成 请求耗时`);
            console.time(`目标${fileNo} 写入完成 线程${fileNo}关闭 I/O耗时`);
        }).pipe(
            fs.createWriteStream(`./images/${fileName}.jpg`)
            .on('error', (fsErr)=>{console.log(fsErr.stack)})
            .on('finish', ()=> {
                console.timeEnd(`目标${fileNo} 写入完成 线程${fileNo}关闭 I/O耗时`);
                fileNo++;
                concurrencyNum--;
                callback(null, [imgUrl]);
            })
        );
        console.timeEnd(`开启并发线程:${concurrencyNo} 目标:${imgUrl} 耗时`);
    }, (asyncErr, asyncRes) => {
        if (asyncErr) console.log(asyncErr);
        // console.log('final:\n', asyncRes);
        console.log(`任务完成。`)
    });
});