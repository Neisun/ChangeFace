## 人民日报军装照换脸demo
首先感谢原文作者，参照原文作者的思路，一步步完成了这个demo，很有趣。
原文地址：
[刷爆朋友圈的穿上军装背后的AI技术及简单实现][1]


> 使用技术

 1. 百度人脸识别
 2. jQuery
 3. Nodejs+express


> 步骤

 - 先准备Node环境。


 全局安装express框架，然后使用express命令，初始化一个项目目录；
 express -e  projectName
 ![enter description here][2]


  [1]: https://www.youyong.top/article/11597fcc6b4ee?yyfr=sf
  [2]: ./images/2017-10-23_162245.jpg "2017-10-23_162245.jpg"
  
 
 - 调通前后端
 找到 views/index.ejs 文件，添加

``` vbscript-html
<script src=“https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
```
找到routes/index.js文件，添加

``` javascript
router.post('/', function(req, res, next) {
  res.send('UFace post ok')
});
```
终端输入

``` puppet
node bin/www
```
浏览器访问localhost:3000
打开开发者工具，在console里调试接口，输入：

``` javascript
$.post("/", function(data) {
  console.log(data);
});
```
看到控制台打印出：

``` stata
UFace post ok
```
这就证明，咱们把前后端调通了。

 - 百度人脸识别api


 在官方网站下载node SDK压缩包。

将下载的 api-node-sdk-version.zip 解压后，复制到工程文件夹中
进入目录，运行 npm install 安装 sdk 依赖库。

在百度AI中申请好APPID；

继续到routes/index.js文件中，加入

``` kotlin
var AipFace = require("baidu-ai").face;

var APP_ID = "994xxx7";
var API_KEY = "WqiVssssssxxvpC7xkAcK96Sf";
var SECRET_KEY = "4exxxxxHGOzy2bZThCyEM0h1";
 //这三个key记得替换为你申请的appid 

var client = new AipFace(APP_ID, API_KEY, SECRET_KEY);
```
上传本地的一张图片，调试下百度AI接口

``` nimrod
var fs = require('fs');
var image = fs.readFileSync('assets/face/face.jpg');
var base64Img = new Buffer(image).toString('base64');

client.detect(base64Img).then(function(result) {  
     console.log(JSON.stringify(result)); 
});
```
找到 views/index.ejs 文件，添加

``` vbscript-html
<script>
        function uploadImg() {
            var formData = new FormData();
            // $('')[0]表示jq对象变成dom对象
            formData.append("file", $("#upload")[0].files[0]);
            console.log($('#upload')[0].files)
            $.ajax({
                type: 'POST',
                url: '/file/uploading',
                data: formData,
                processData: false,
                contentType: false,
                success: function(res) {
                    var json = JSON.parse(res);
                    console.log(json);
                    createFace(json);
                    //从后端获取到人脸检测到结果后，调用createFace函数，进行图片合成  
                }
            });
        };

        function createFace(json) {
            var jzimg = $('#jz')[0];
            console.log(jzimg)
            var img = $('#target')[0];
            var canvas = $('#canvas')[0];
            var ctx = canvas.getContext('2d');

            var sx = json.result[0].location.left,
                sy = json.result[0].location.top,
                swidth = json.result[0].location.width,
                sheight = json.result[0].location.height;
            ctx.drawImage(img, sx, sy, swidth, sheight, 195, 65, 67, 60);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(jzimg, 0, 0);

            //globalCompositeOperation = 'source-over';  这个是用来把抠出来到人脸，合成到军装里到关键设置，可以合成任意到图片，并保留图片到透明信息哦。
            // 相当于ps里的图层叠加概念

        };
    </script>
```

后端获取前端提交的图片，并通过百度AI接口调取识别结果；

找到routes/index.js文件，添加

``` javascript
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');

router.post('/file/uploading', function(req, res, next) {

    var form = new multiparty.Form({
        uploadDir: './public/files/'
    });

    form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files, null, 2);

        if (err) {
            console.log('parse error: ' + err);
        } else {
            console.log('parse files: ' + filesTmp);

            var inputFile = files.file[0];
            var uploadedPath = inputFile.path;

            var image = fs.readFileSync(uploadedPath);
            var base64Img = new Buffer(image).toString('base64');

            client.detect(base64Img).then(function(result) {
                res.send(JSON.stringify(result));
            });

        };

    });

});
```

index.ejs文件

``` vbscript-html
<!DOCTYPE html>
<html>

<head>
    <title>
        <%= title %>
    </title>
    <link rel='stylesheet' href='/stylesheets/style.css' />
    <script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
</head>

<body>
    <h1>
        <%= title %>
    </h1>
    <p>Welcome to
        <%= title %>
    </p>
    <form id="uface">
        <input type="file" name="files" id="upload">
        <button type="button" onClick="uploadImg()">submit</button>
    </form>
    <div class="outer">
        <img id="jz" src="/images/jz.png" style="display: none;">
        <img id="target" src="/images/1.jpg" style="display: none;">
        <canvas id="canvas" width="384" height="284"></canvas>
    </div>
    <script>
        function uploadImg() {
            var formData = new FormData();
            // $('')[0]表示jq对象变成dom对象
            formData.append("file", $("#upload")[0].files[0]);
            console.log($('#upload')[0].files)
            $.ajax({
                type: 'POST',
                url: '/file/uploading',
                data: formData,
                processData: false,
                contentType: false,
                success: function(res) {
                    var json = JSON.parse(res);
                    console.log(json);
                    createFace(json);
                    //从后端获取到人脸检测到结果后，调用createFace函数，进行图片合成  
                }
            });
        };

        function createFace(json) {
            var jzimg = $('#jz')[0];
            console.log(jzimg)
            var img = $('#target')[0];
            var canvas = $('#canvas')[0];
            var ctx = canvas.getContext('2d');

            var sx = json.result[0].location.left,
                sy = json.result[0].location.top,
                swidth = json.result[0].location.width,
                sheight = json.result[0].location.height;
            ctx.drawImage(img, sx, sy, swidth, sheight, 195, 65, 67, 60);
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(jzimg, 0, 0);

            //globalCompositeOperation = 'source-over';  这个是用来把抠出来到人脸，合成到军装里到关键设置，可以合成任意到图片，并保留图片到透明信息哦。
            // 相当于ps里的图层叠加概念

        };
    </script>
</body>

</html>
```
这里需要写好结构，表单用来上传文件用，而下边的div是用来放空白的军装照和目标img，以及canvas；
其中有一点，个人没有做好。正常来说，id为target的那个img的src应该是获取上传文件存在的位置，但是由于我暂时无法获取到，就直接写死了。
需要想个办法去获取一下。


