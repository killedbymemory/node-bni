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
  var match = url.match(/[1-9][0-9]$/);
  return match && match.length && match[0] != undefined && parseInt(match[0]);
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

function getCategoryItems(category) {
  // console.log(category);
  return new RSVP.Promise(function(resolve, reject) {
    var categoryItems = [
      {title: [category.title, "UGG Australia"].join(' '), description: "Fashionable luxury with UGG", validity: '2015-05-28', url: '/promo/view/16/670'},
      {title: [category.title, "UGG Australia 2"].join(' '), description: "Not so fashionable luxury with UGG", validity: '2015-05-30', url: '/promo/view/16/671'},
      {title: [category.title, "UGG Australia 3"].join(' '), description: "So-so fashionable luxury with UGG", validity: '2015-05-30', url: '/promo/view/16/673'}
    ];

    category["items"] = categoryItems;

    resolve(category);
  });
}

function render(categories) {
  var util = require('util');
  console.log(util.inspect(categories, {depth: null}));
}

function handleError() {
  console.log("error");
}

function getPromotions() {
  var promise = new RSVP.Promise(function(resolve, reject) {

    getCategories().then(function(categories) {
      var categoriesItems = categories.map(function(category) {
        return getCategoryItems(category);
      })

      RSVP.all(categoriesItems)
        .then(function(categoriesItems) {
          resolve(categoriesItems);
        })
        .catch(function() {
          console.log("RSVP.all.catch :(");
        })
    }).catch(handleError);

  });

  return promise;
}

// getPromotions().then(render);
getCategories().then(render);