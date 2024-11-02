const request = require("request");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
var schema = require("./model/model");
var uri = require("./config/key").MongoURI;
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Mongoose connected");
  })
  .catch((err) => console.log(err));

var c = 0;

for (let start = 10; start <= 230; start += 10) {
  request(
    `https://www.yelp.com/search?cflt=restaurants&find_loc=San%20Francisco%2C%20CA&start=${start}`,
    (err, response, html) => {
      if (!err && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var titleArray = [];
        var imgArray = [];
        var addressArray = [];
        var hourArray = [];
        var latArray = [];
        var lngArray = [];
        var addressArray = [];
        var urlpaths = [];
        // Name
        var titleCounter = 0;
        $(".css-1pxmz4g").each((i, el) => {
          titleCounter++;
          var title = $(el).children("a.css-1f2a2s6").text();
          titleArray.push(title);
        });
        // console.log(titleCounter);
        // image URL`
        var imgCounter = 0;
        var img = $(".css-xlzvdl");
        img.each((i, el) => {
          var imgUrl = $(el).attr("src");
          imgCounter++;
          imgArray.push(imgUrl);
        });
        // location and business hours
        var x = $("a.css-s3mx9d").each((i, el) => {
          var uris = $(el).attr("href");
          urlpaths.push(uris);
        });
        urlpaths.pop();
        urlpaths.splice(0, 1);
        var cou = 0;
        for (let ind = 0; ind <= 10; ind++) {
          request(`https://www.yelp.com/${urlpaths[ind]}`, (err, res, html) => {
            if (!err && res.statusCode == 200) {
              cou++;

              const $ = cheerio.load(html);
              // Address
              addressArray[ind] = $("p.css-chtywg").text();
              // Buisness hours
              var openings = [];

              for (let i = 2; i <= 14; i += 2) {
                for (let j = 1; j <= 2; j++) {
                  var weekday =
                    $(
                      `tr.table-row__373c0__1F6B0:nth-child(${i}) > th:nth-child(1) > p:nth-child(1)`
                    ).text() +
                    " : " +
                    $(
                      `tr.table-row__373c0__1F6B0:nth-child(${i}) > td:nth-child(2) > ul:nth-child(1) >
    li:nth-child(${j}) > p:nth-child(1)`
                    ).text();
                  openings.push(weekday);
                }
              }
              hourArray[ind] = openings;
              //  Latitiude and longtitude

              var mapurl = $(
                ".container__373c0__17VNc > img:nth-child(1)"
              ).attr("src");
              var params = new URLSearchParams(mapurl);
              var u = params.get("center");
              // console.log(u);
              if (u != null) {
                var x = u.split(",");
                var lat = x[0];
                var lng = x[1];
                latArray[ind] = lat;
                lngArray[ind] = lng;
              }
              // Saving in the database
              if (
                titleArray[ind] != null &&
                imgArray[ind] != null &&
                addressArray[ind] != null &&
                latArray[ind] != null &&
                lngArray[ind] != null &&
                hourArray[ind] != null
              ) {
                var restos = new schema({
                  name: titleArray[ind],
                  imgurl: imgArray[ind],
                  address: addressArray[ind],
                  latitude: latArray[ind],
                  longtitude: lngArray[ind],
                  hours: hourArray[ind].toString(),
                });

                restos
                  .save()
                  .then(() => {
                    c++;
                    console.log(c);
                  })

                  .catch((err) => console.log(err));
              }
            } else {
              console.log(response.statusCode);
              console.log(err);
            }
          });
        }
      } else {
        console.log(response.statusCode);
        console.log(err);
      }
    }
  );
}
