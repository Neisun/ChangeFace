var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});
// 添加的post
router.post('/', function(req, res, next) {
    res.send('UFace post ok')
});
var AipFace = require("baidu-aip-sdk").face;

var APP_ID = "10260259";
var API_KEY = "I77GWZh2MXxDqikIgitKlXHK";
var SECRET_KEY = "PinNFfI9KKISUD37AzLf1MEelDg3IyVH";
//这三个key记得替换为你申请的appid 
var client = new AipFace(APP_ID, API_KEY, SECRET_KEY);

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


module.exports = router;