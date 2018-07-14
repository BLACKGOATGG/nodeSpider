const request = require("request"); //请求
const iconv = require('iconv-lite');    //解码
const cheerio = require("cheerio"); //dom
const fs = require('fs');   //io

let size = 10;  //爬取数量
let i = 1;    //计数器(从1开始)
let page = 691377;  //起始地址

function start() {
    let options = { //请求头
        url: `http://www.mmbb77.space/fcyv/${page}.html`,
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
    };
    
    request(options, function (err, res) {
        if (err) console.log(err);
        // let html = [];   //iconv解码，暂时不知道什么问题
        // html.push(res);
        // let htmlInit = iconv.decode(Buffer.concat(html), 'gb2312');
        // let $ = cheerio.load(htmlInit);

        let $ = cheerio.load(res.body.toString());  //初始化$对象
        //准备数据容器及数据
        let title = $('.position').text().replace('您的位置', '').replace('：', '').replace('首页', '').replace('»', '').replace('自拍偷拍', '').replace('»', '');
        title = title.replace(/(^\s+)|(\s+$)/g, "");
        title = title.replace(/\s/g, "");//文件夹名
        let imgFileList = [];  //文页面图片地址列表
        let index = 0;    //当前爬取文件在imgFileList里的下标
        fs.mkdir("./data_img/" + title, (err) => { if (err) console.log(err) });    //创建对应文件夹
        $('.picContent').find("img").each((index, element) => {
            imgFileList.push($(element).attr('src'))
        })
        console.log(title + " ---------开始爬取");
        savedImg(title, imgFileList, index);
    })
}
//io操作,在本地存储所爬取到的图片资源
function savedImg(title, imgFileList, index) {
    let file_name = imgFileList[index].substring(50);
    request(imgFileList[index])
        .on('response', (res) => { console.log(imgFileList[index] + "开始爬取"); })
        .pipe(fs.createWriteStream("./data_img/" + title + "/" + file_name))
        .on("error", (e) => { console.log("pipe error", e) })
        .on("finish", () => { console.log(imgFileList[index] + " ---------爬取完成"); })
        .on("close", () => {
            index++;
            if (imgFileList[index]) {
                savedImg(title, imgFileList, index)
            } else {
                i++;    //计数器
                page=page-1; //下一篇html的url
                console.log("page==>"+page)
                if (i <= size) {
                    console.log("-----------本页爬取完成，剩余" + (size - i) + "个任务----------");
                    start();
                }
            };
        })
};
start();