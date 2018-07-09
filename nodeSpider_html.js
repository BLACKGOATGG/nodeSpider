//引入依赖的模块
let request = require("request");
let cheerio = require("cheerio");

//为可拓展封装一层函数
let getData =()=> {
    let newData = [];   //盛放数据的容器
    let options = {     //设置请求地址及请求头信息
        url: "http://jwc.scu.edu.cn/",
        method: 'GET',
        charset: "utf-8",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36",
        }
    };
    //使用request模块发起请求
    request(options, function (error, response) {
        if (error) console.log(error);
        //html方案，抓取html页面使用cheerio模块来将html文档dom结构化
        let $ = cheerio.load(response.body.toString());
        //遍历指定的dom节点获取信息
        $("body").find(".list-llb-s").children(".list-llb-list").each(function(index,element){
            let time=$(element).find(".list-date-a").text();
            let title=$(element).find(".list-llb-text").text();
            //将所需要的信息保存进制备的容器中
            newData.push({"time":time,"title":title})
        })
        console.log(newData);   //打印数据
    })
}
getData();