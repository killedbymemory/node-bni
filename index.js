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

/*
function handleCategoryPage(err, response, body) {
    if (err) {
      console.log(err);
      return;
    }

    debugger;

    // successfully logged in!
    // now, lets get our balance!
    var balanceInquiry = util._extend({}, base_options);
    balanceInquiry.method           = "POST";
    balanceInquiry.url             += '/balanceinquiry.do';
    balanceInquiry.headers.origin   = "https://m.klikbca.com";
    balanceInquiry.headers.referer  = "https://m.klikbca.com/accountstmt.do?value(actions)=menu";

    request.post(balanceInquiry, function(err, balanceResponse, balanceBody) {
      // yeehaw
      debugger;

      var jquery = require('fs').readFileSync("./jquery-1.9.1.js", "utf-8");
      var jsdom = require('jsdom');

      jsdom.env({
        html    : balanceBody,
        src     : [jquery],
        done    : function(err, window){
          debugger
          var $     = window.jQuery;
          var saldo = $("#pagebody table:nth-child(2)  td:nth-child(2)  tr:nth-child(2) td:nth-child(3) font > b").html();
          console.log(saldo);
      }});

      // now lets logout
      var logout = util._extend({}, base_options);
      logout.method           = "GET";
      logout.url             += '/authentication.do?value(actions)=logout';
      logout.headers.origin   = "https://m.klikbca.com";
      logout.headers.referer  = "https://m.klikbca.com/balanceinquiry.do";

      request.post(logout, function(err, logoutResponse, logoutBody) {
        if (err) {
          console.log(err);
          return;
        }

        // fin...
      });
    })
}
*/

function getCategories() {
  // category_page is a duplicate of base_options
  var category_page = util._extend({}, base_options);
  category_page.url += '/category/index/promo';

  var promise = new RSVP.Promise(function(resolve, reject) {
    var categories = [
      {url: '/promo/index/16', title: 'Fashion'},
      {url: '/promo/index/17', title: 'Groceries'},
      {url: '/promo/index/18', title: 'Food and Beverage'}
    ];

    resolve(categories);
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