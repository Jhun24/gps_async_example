/**
 * Created by janghunlee on 2018. 6. 8..
 */
module.exports = request;

var request = require('request');
var ayc = require('async');
var mongoose = require('mongoose');
var urlencode = require("urlencode");

mongoose.connect("mongodb://localhost/afsd", (err) => {
    if(err){
        console.log("db connected error");
        throw err;
    }
});

var LocSchema = mongoose.Schema({
    title : String,
    address : String,
    roadAddress : String,
    longitude : String,
    latitude : String
});

var LocData = mongoose.model('location', LocSchema);

var check_num = 1;

function getData(item) {
    ayc.waterfall([
        function (callback) {
            var GPS_opt = {
                url: 'https://dapi.kakao.com/v2/local/geo/transcoord.json?input_coord=KTM&output_coord=WGS84&x='+item.mapx+'&y='+item.mapy,
                headers:{
                    'Authorization':'KakaoAK 4943231fa67b4c345b3478622ec20144'
                }
            };

            request(GPS_opt,(err ,response ,body)=>{
                "use strict";
                if(err) throw err;
                var json_data = JSON.parse(body);
                callback(null , json_data.documents[0]);
            });
        },
        function (gps , callback) {
            console.log(gps);
            var saveLoc = new LocData({

                title : item.title,
                address : item.address,
                roadAddress : item.roadAddress,
                longitude : gps.x,
                latitude : gps.y
            });
            saveLoc.save((err,model)=>{
                "use strict";
                if(err) throw err;
            });
        }
    ]);
}


function request(app) {
    app.get('/request',(req,res)=>{
        "use strict";
        var options = {
            url: 'https://openapi.naver.com/v1/search/local.json?display=15&start='+ "1" +'&query='+urlencode('카페'),
            headers: {
                'X-Naver-Client-Id': 'djXqKlGSzwJRLfpChMsX',
                'X-Naver-Client-Secret':'pRfku1I1au'
            },
        };

        request(options,(err,response ,body)=>{
            if(err)throw err;
            var json_data = JSON.parse(body);
            console.log(json_data.items.length);
            for(var i = 0; i<json_data.items.length; i++){
                getData(json_data.items[i]);
            }
            res.send("success");
        });
    });
}