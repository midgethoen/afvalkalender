var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');

function scrape(zipdigits, zipletters, streetnumber, clb) {
  async.waterfall([
    get_wsa,
    function (wsa, clb) {
      get_calendar_page(wsa, zipdigits, zipletters, streetnumber, clb);
    }],
    clb);
}

function get_wsa(clb) {
    var url = 'http://www.irado.nl/bewoners/afvalkalender';
    console.log('requesting for wsa');
    request(url, function(error, response, html){
      if (error){
        return clb(error);
      }
      if (response.statusCode !== 200){
        return clb(new Error('Unexpected http status ('+response.statusCode+')'));
      }

      console.log('parsing for swa');
      var $ = cheerio.load(html);
      var wsa = $('input[name=wsa_calendar]').val()

      if (!wsa){
        return clb(new Error('wsa_calendar value could not be found'));
      }

      clb(null, wsa);
    });
}

function get_calendar_page(wsa, zipdigits, zipletters, streetnumber, clb) {
    var url = 'http://www.irado.nl/bewoners/afvalkalender';
    console.log('requesting for calendar_page');
    request.post(
      url, 
      {
        form: {
          appointment_zipcode        : zipdigits,
          appointment_zipcode_suffix : zipletters,
          appointment_housenumber    : streetnumber,
          wsa_calendar               : wsa,
          _wp_http_referer           : '/bewoners/afvalkalender'
        }
      },
      function (error, response, html) {
        console.log('got it');
        if (error){
          return clb(error);
        }
        if (response.statusCode !== 200){
          return clb(new Error('Unexpected http status ('+response.statusCode+')'));
        }
        clb(null, html);
      }
    )
}

function parse_dates(html, clb){
  var $ = cheerio.load(html);
  var pickups = [];
  var months = [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'october',
    'novermber',
    'december',
  ];

  var cur_month = (new Date()).getMonth()
    , cur_year  = (new Date()).getYear();
  $('.month-slide').each(function (idx) {
    var $elem = $(this);
    var month = MONTHS.indexOf($elem.find('.avk-cal-header').html());
    if (month < cur_month || idx !== 0 && month == cur_month){
      month += 12; //this is next year
    }
  };
}

exports.scrape = scrape;
exports.get_wsa = get_wsa;
