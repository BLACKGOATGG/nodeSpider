//准备脚本所需要的依赖
let request = require("request");

//为可拓展封装一层函数
let getData =()=> {
    let newData = [];   //盛放数据的容器
    let options = {     //设置请求地址及请求头信息
        url: "http://jwc.scu.edu.cn:8081/queryPageGetJsonp?wzid=56C4C8887055402FE0530100007FF95C&keywords=&pageNo=1&pageSize=10&lmid=178",
        method: 'GET',
        charset: "utf-8",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36",
        }
    };
    //使用request模块发起请求
    request(options, function (error, response) {
        if (error) console.log(error);
        //接口方案，当抓取的是一个接口的时候，整个过程就像是一次ajax请求,注意转换json格式
        let res=JSON.parse(response.body);
        let data=res.documents;
        //将获取到的数据格式化为自己所需要的格式
        for (let key in data) {
            let time=data[key][7];
            let title=data[key][0];
            let msg=data[key][10].replace(" ","");
            newData.push({"time":time,"title":title,"msg":msg});
        }
        console.log(newData)    //打印数据
    })
}
getData();