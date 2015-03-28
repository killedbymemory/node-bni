var util = require('util'),
    request = require('request'),
    RSVP = require('rsvp');

var cookie_jar = request.jar(),
    base_options = {
      url: 'http://m.bnizona.com/index.php',
      headers: {
        'pragma': "no-cache",
        'host': "m.bnizona.com",
        'accept-language': "en-US,en;q=0.8",
        'user-agent': "User-Agent:Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Nexus S Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
        'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        'cache-control': 'no-cache'
      },

      // enable Cookie jar while having a reference to it
      jar: cookie_jar
    };

var jquery = require('fs').readFileSync("./jquery-1.9.1.js", "utf-8"),
    jsdom = require('jsdom');

function extractCategoryId(url) {
  var match = url.match(/\/([0-9]?[0-9]{1,})$/); // /01, /1, /015, 15, /123, etc
  return match && match.length && match[1] != undefined && parseInt(match[1]);
}

function getCategories() {
  // category_page is a duplicate of base_options
  var category_page = util._extend({}, base_options);
  category_page.url += '/category/index/promo';

  var promise = new RSVP.Promise(function(resolve, reject) {
    request.get(category_page, function(err, response, body) {
      jsdom.env({
        html: body,
        src: [jquery],
        done: function(err, window) {
          var $ = window.jQuery,
              $categoriesListItems = $("body > div.row > div.container > div > ul.menu > li"),
              categories = [];

          $categoriesListItems.each(function(){
            var $anchor = $('a:first', this),
                category = {
                  'id': extractCategoryId($anchor.attr('href')),
                  'url': $anchor.attr('href').replace(base_options.url, ''),
                  'title': $anchor.html()
                };

            categories.push(category);
          })

          resolve(categories);
        }
      });
    })
  });

  return promise;
}

function extractPromotionId(url) {
  var match = url.match(/\/([0-9]?[0-9]{1,})$/);
  return match && match.length && match[1] != undefined && parseInt(match[1]);
}

function getPromotionsByCategory(category) {
  var promise = new RSVP.Promise(function(resolve, reject) {
    var category_promotions_page = util._extend({}, base_options);
    category_promotions_page.url += category.url;

    request.get(category_promotions_page, function(err, response, body) {
      jsdom.env({
        html: body,
        src: [jquery],
        done: function(err, window) {
          var $ = window.jQuery,
              $promotionsListItems = $("ul#lists > li"),
              promotions = [];

          $promotionsListItems.each(function(){
            var $anchor = $('a:first', this),
                promotion = {
                  'id': extractPromotionId($anchor.attr('href')),
                  'url': $anchor.attr('href').replace(base_options.url, ''),
                  'title': $('span.promo-title', $anchor).html(),
                  'merchant_name': $('span.merchant-name', $anchor).html(),
                  'valid_until': $('span.valid-until', $anchor).html().replace('valid until ', ''),
                  'img': $('img:first', $anchor).attr('src'),
                };

            promotions.push(promotion);
          })

          category["promotions"] = promotions;
          resolve(category);
        }
      });
    })
  });

  return promise;
}

function render(categories) {
  var util = require('util');
  console.log(util.inspect(categories, {depth: null}));
}

function handleError() {
  console.log("error");
}

function getAllPromotions() {
  var promise = new RSVP.Promise(function(resolve, reject) {
    getCategories().then(function(categories) {
      var promotionPromises = categories.map(function(category) {
        return getPromotionsByCategory(category);
      })

      RSVP.all(promotionPromises)
        .then(function(categories) {
          resolve(categories);
        })
        .catch(function() {
          console.log("RSVP.all.catch :(");
        })
    }).catch(handleError);

  });

  return promise;
}

// get categories only:
// getCategories().then(render);

// get all promotions by a category:
// getPromotionsByCategory({id: 16, url: '/promo/index/16', title: 'Fashion'}).then(render);

// get all promotions:
getAllPromotions().then(render);