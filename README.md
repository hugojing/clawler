# crawler

## 抓取结果

http://bit.ly/1U3mm1i

## 代码中的抓取目标貌似已经新增了反爬虫机制，不过你还可以学到：


+ 异步编程（也就是 callback）

+ callback 嵌套（相互有依赖的串行操作，层层嵌套；当然你也可以用别的东西避免嵌套）

+ 用 eventproxy 的 after 和 emit 来做相互无依赖的并行操作、等待所有操作完成后汇总结果

+ 用 cheerio 体验服务器端如何通过 CSS Selector 定位 HTML 中的元素和内容


## 最终效果类似下图（但并不是）
![最终效果图 x 1 :](https://raw.githubusercontent.com/hugojing/clawler/master/data/crawler_final.jpg)
