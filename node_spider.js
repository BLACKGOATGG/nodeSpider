const request = require("request");
const cheerio = require("cheerio");
const async = require('async');
const fs = require('fs');

let pageNo = 10;  //爬取页数
let index = 693937;  //起始地址

console.log(`spider of node start`);
let downPageNo = 1;  //当前正在爬取的页数
function start() {
    request({
        // url需要优化
        url: `http://www.mmbb77.space/fcyv/${index}.html`,
        method: 'GET',
        charset: "utf-8",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate",
            "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
            "Connection": "keep-alive",
            "Cookie": "Hm_lvt_4b7e3399425533b25385d99f54903f35=1522761139",
            "Host": "www.mmbb77.space",
            "Upgrade-Insecure-Requests": 1,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0"
        }
    }, function (err, res) {
        if (err) console.log(err);
        //准备数据容器及数据
        let concurrencyCount = 5; //初始化最大并发数
        let concurrencyNum = 0; //初始化当前并发数
        let concurrencyNo = 0; //初始化自定义线程名
        let imgUrls = []; //初始化用于存放所有图片url的容器
        let imgNo = 1; //初始化img序号
        // let fileName = undefined; //初始化图片名参数，，第一次$获取不到
        let $ = cheerio.load(res.body.toString());  //初始化dom
        let title = $('.position').text().replace('您的位置', '').replace('：', '').replace('首页', '').replace('»', '').replace('亚洲色图', '').replace('»', '');
        title = title.replace(/(^\s+)|(\s+$)/g, "");
        title = title.replace(/\s/g, "");//文件夹名 
        /* 这个获取title的方法并不好，虽然可以获取到完整而正确的title
        但足缺点也很明显，爬取不同的模块要写不同的配置，很麻烦，不能做到自动化 */
        fs.mkdir("./img/" + title, (err) => { if (err) console.log(err) });    //创建对应文件夹
        $('.picContent').find("img").each((i,e) => { imgUrls.push($(e).attr('src')) })    //每爬取一个页面后将本页面imgurl存放进准备好的容器中
        //数据准备完毕，开始爬取
        console.log(imgUrls);
        console.log(`${title}开始爬取，最大开启线程${concurrencyCount}，目标数量：${imgUrls.length}`);
        async.mapLimit(imgUrls, concurrencyCount, (imgUrl, callback) => {
            concurrencyNum++;
            concurrencyNo++;
            console.time(`开启并发线程:${concurrencyNo} 目标:${imgUrl} 耗时`);
            console.time(`当前并发数量:${concurrencyNum} 目标${imgNo} 请求完成 请求耗时`);
            request({
                url: imgUrl,
                method: 'GET',
                charset: "utf-8",
                headers: {
                    "referer": `http://www.mmbb77.space/fcyv/${index}.html`,
                    "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
                }
            }, (fetchErr, fetchRes) => {
                if (fetchErr) console.log(fetchErr);
                // fileName = imgUrl.slice(imgUrl.length - 7); //自定义目标图片名，这个方法并不好虽然概率小，但也有可能图片重名
                console.timeEnd(`当前并发数量:${concurrencyNum} 目标${imgNo} 请求完成 请求耗时`);
                /* 因为这是异步并发并不是真正的多线程
                在这里使用concurrencyNo并不能保证准确性
                所以使用imgNo来代替concurrencyNo来保证一定的准确性 */
                console.time(`当前并发数量:${concurrencyNum} 目标${imgNo} 写入完成 线程${imgNo}关闭 I/O耗时`);
            }).pipe(
                fs.createWriteStream(`./img/${title}/${imgNo}${imgUrl.slice(imgUrl.length - 4)}`)
                .on('error', (fsErr) => { console.log(fsErr.stack) })
                .on('finish', () => {
                    console.timeEnd(`当前并发数量:${concurrencyNum} 目标${imgNo} 写入完成 线程${imgNo}关闭 I/O耗时`);
                    imgNo++;
                    concurrencyNum--;
                    callback(null, [imgUrl]);
                })
            );
            console.timeEnd(`开启并发线程:${concurrencyNo} 目标:${imgUrl} 耗时`);
        }, (asyncErr, asyncRes) => {
            if (asyncErr) console.log(asyncErr);
            downPageNo++;
            if (downPageNo <= pageNo) {
                index--;
                start();
            } else {
                return console.log(`任务完成。`);
            }
        });
    })
}
start();