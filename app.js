var eventproxy = require('eventproxy');
var cheerio = require('cheerio');
var superagent = require('superagent');
var fs = require('fs');

for (var i = 1; i < 6; i++) {
    var basicUrl = 'http://www.arita.cc/art/?page=';
    getEveryPage(basicUrl, i);
};

function getEveryPage(basicUrl, i) {
    superagent.get(basicUrl + i)
    .end(function(err, sres) {
        if (err) {
            console.log(err);
            return
        }
        var postUrls = [];
        var $ = cheerio.load(sres.text);
        // 获取目标页的所有链接
        $('#fallsLayout').find('.figure').each(function() {
            var href = 'http://www.arita.cc' + $(this).find('a').attr('href');
            postUrls.push(href);
        });
        console.log('现在抓取到目标网站的第 ' + i + ' 页');
        console.log('在本页抓取到' + postUrls.length + ' 个帖子');
        console.log('=================');

        var ep = new eventproxy();
        // 重复异步协作
        ep.after('post_html', postUrls.length, function(posts) {
            // 在所有获取帖子的异步执行结束后, 将结果汇总到 posts ,然后执行这个
            posts = posts.map(function(postpair) {
                // 对数组中的每个元素都执行一次指定的函数（callback），并且以每次返回的结果为元素创建一个新数组
                var postUrl = postpair[0];
                var postHtml = postpair[1];
                var $ = cheerio.load(postHtml);

                var contentImages = [];
                $('.rich_media_content').find('img').each(function() {
                    var contentImage = $(this).attr('data-src');
                    contentImages.push(contentImage);
                });
                contentImages.splice(-1, 1);

                var art_num_data = {
                    postUrl: postUrl,
                    title: $('#activity-name').text().trim().substr(5),
                    category: 'art',
                    publishTime: $('#post-date').text().trim(),
                    author: $('.rich_media_meta_nickname').eq(0).text().trim(),
                    contentText: $('.rich_media_content').text().trim(),
                    contentImages: contentImages
                };
                return (art_num_data);
            });

            posts = {
                "encoding": 'utf-8',
                "num": posts.length,
                "posts": posts
            };
            console.log('抓取结果:');
            console.log(posts);

            // 保存到 JSON 文件
            var jsondata = JSON.stringify(posts, null, 2);
            fs.writeFile('./data/aritacc_posts.json', jsondata, 'utf-8', function(err) {
                if (err) {
                    throw err;
                } else {
                    console.log('保存成功, 赶紧去看看乱码吧');
                }
            });
        });

        // 获取每个帖子的内容，获取到以后用 emit 通知 ep ，然后 ep 就可以 after
        postUrls.forEach(function(postUrl) {
            superagent.get(postUrl)
                .end(function(err, res) {
                    if (err) {
                        console.log(err);
                        return
                    }
                    console.log('抓取 ' + postUrl + ' 成功.');
                    ep.emit('post_html', [postUrl, res.text]);
                });
        });

    });
};
