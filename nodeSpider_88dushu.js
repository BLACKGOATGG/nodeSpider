//引入模块
const http = require('http')
const fs = require('fs')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
let request = require('request');

const zzxxxc = [
    'http://www.88dushu.com/xiaoshuo/69/69252/'
];

// http://www.biquge.cm/8/8726/
let bookLists = [];
let bookName = '';
let m = 0;
hrefs();

/**
 * 初始化存储章节
 */
function hrefs() {
    if (m < zzxxxc.length) {
        http.get(zzxxxc[m], res => {
            const html = []
            res.on('data', (chunk) => {
                html.push(chunk)
            })
            res.on('end', () => {
                const html1 = iconv.decode(Buffer.concat(html), 'gb2312');
                const $ = cheerio.load(html1);
                var ddsli = {};
                let result = $('.mulu').find('li');
                bookName = $('.rt h1').text();

                let key = ''; // 用于存储书名
                result.each((i, elem) => {
                    let $hrefTag = $(elem).find('a') || false;
                    if ($hrefTag) {
                        $hrefTag.each((i, elem) => {
                            let bookCharInfo = {};
                            if ($(elem).text().trim() !== '插图') {
                                bookCharInfo.charName = $(elem).text().trim();
                                bookCharInfo.charUrl = zzxxxc[m] + $(elem).attr('href');
                                bookLists.push(bookCharInfo);
                            }
                        });
                    }
                });
                m++;
                txtWord()
            });
        })

    } else {
        return '';
    }
}
let i = 0;

function txtWord() {
    let hrefUrls = bookLists[i].charUrl;
    request({
        url: hrefUrls,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
        },
        encoding: null
    }, function (error, response, body) {
        if (response && response.statusCode == 200) {
            // 获取数据完毕后，使用iconv-lite转码，decedo中为Buffer对象，Buffer.concat为数组
            const html1 = iconv.decode(body, 'gb2312');
            const $ = cheerio.load(html1);
            var ddsli = {}; // 处理数据
            var bokname = $('.novel h1').text() + '.'.replace(/./g, '\n');
            var contentTxt = $('.yd_text2').text().trim().replace(/\s/g, "").replace(/。/g, '。\n') + '.'.replace(/./g, '\r\n');
            fs.appendFile('./' + bookName + '.txt', (bokname + contentTxt), function (err) {
                if (err) console.log(err);
                if (i < bookLists.length - 1) {
                    i++;
                    console.log('开始下载==>' + bokname.replace(/[\r\n]/g, ""));
                    txtWord();
                } else {
                    console.log('下载完成,进入下一本');
                    hrefs();
                }
            });
        } else {
            txtWord();
        }
    });
}
/**
 * 剔除空格
 * @param {*字符串} str 
 */
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '').replace(/ /g, '')
}