var $ = require('cheerio'),
      util = require('util'),
      request = require('request'),
      EventEmitter = require('events').EventEmitter;

var PlaceCodes = require('./lib/place_codes');

/**
* SNCF-delays class
* Use it with
* var client = require('sncf-delays');
*
* @return object An instanciated SNCF-delays class
*/
var SNCF = function(){
};

/**
* SNCF places codes
*
* @return {Object} A PlaceCodes object
*/
SNCF.prototype.codes = function() {
  return PlaceCodes;
};

/**
* Check a place delays, among departures
*
* @param {String} place The place name, or code
* @param {Function} callback The request callback(error, delays)
* @return {Request} The request object
*/
SNCF.prototype.departuresDelaysAt = function(place, callback) {
  return this.delaysAt(place, 'departures', callback);
};

/**
* Check a place delays, among arrivals
*
* @param {String} place The place name, or code
* @param {Function} callback The request callback(error, delays)
* @return {Request} The request object
*/
SNCF.prototype.arrivalsDelaysAt = function(place, callback) {
  return this.delaysAt(place, 'arrivals', callback);
};

/**
* Check a place delays
*
* @param {String} place The place name, or code
* @param {String} direction Either 'departures' or 'arrivals'
* @param {Function} callback The request callback(error, delays)
* @return {Request} The request object
*/
SNCF.prototype.delaysAt = function(place, direction, callback) {
  place = PlaceCodes.name(place) || place;
  var self = this;
  direction = (!direction || direction.indexOf('dep') > -1) ? 'dep' : 'arr';
  // HTTP request to  http://www.gares-en-mouvement.com
  return request({
    url: 'http://www.gares-en-mouvement.com/fr/' + place + '/horaires-temps-reel/' + direction + '/',
    headers: {
      'Host' : 'www.gares-en-mouvement.com'
    },
  }, function (resp, status, body) {
    self.parseTable(body, place, callback);
  });
};

/**
* Parse an html table from http://www.gares-en-mouvement.com
*
* @param {String} html The HTML page
* @param {String} html The place name or code (optional)
* @param {Function} callback The request callback(error, delays)
* @return {Array} A delays array
*/
SNCF.prototype.parseTable = function(html, place, callback) {
  if (!callback && typeof place === 'function') {
    callback = place;
    place = null;
  }
  var $table = $.load(html);
  var delays = [];
  var caption = $table("caption").text(),
        direction_dep = caption.indexOf('au départ') > -1;
  // Iterate on each table row
  $table("table.tab_horaires_tps_reel tbody tr").each(function(i, row){
    var $row = $(this);
    var delay_text = $row.find("[headers~=situation_id]").text(),
          delay_seconds = 0,
          delay_order = 'minutes',
          delay_canceled = delay_text === 'SUPPRIMÉ',
          delay_unknown = delay_text === 'RETARD INDÉTERMINÉ';

    // there is no delay in this row
    if (delay_text.indexOf("Retard") === -1) {
      return;
    }

    if (delay_text.match(/mn/)) {
      delay_order = 'minutes';
      delay_seconds = parseInt(delay_text.replace(/[^0-9]*/g, ''), 0) * 60;

    } else if (delay_text.match(/h/)) {
      delay_order = 'hours';
      delay_seconds = parseInt(delay_text.replace(/[^0-9]*/g, ''), 0) * 60 * 60;
    }

    // Create a delay object
    var delay = {
      delay_text: delay_text,
      delay: delay_seconds,
      order: delay_order,
      canceled: delay_canceled,
      unknown: delay_unknown,
      from: !direction_dep ? $row.find('.tvs_td_originedestination').text() : place,
      to: direction_dep ? $row.find('.tvs_td_originedestination').text() : place,
      carrier_logo: $row.find('.tvs_td_marque img').attr('src'),
      type: $row.find('.tvs_td_type').text(),
      train_time: $row.find('.tvs_td_heure').text(),
      train_id: $row.find('.tvs_td_numero').text(),
      train_deck: $row.find('.tvs_td_voie').text()
    };
    delay._hash = require('crypto')
                            .createHash('md5')
                            .update(JSON.stringify(delay))
                            .digest("hex");

    delays.push(delay);
  });

  callback(null, delays);
};

SNCF.prototype.onDeparturesDelaysAt = function(place, direction, callback) {
  return this.onDelaysAt(place, 'departures', callback);
};

SNCF.prototype.onArrivalsDelaysAt = function(place, direction, callback) {
  return this.onDelaysAt(place, 'arrivals', callback);
};

SNCF.prototype.onDelaysAt = function(place, direction, callback) {
  var self = this;
  var emitter = new EventEmitter();
  return setInterval(function(){
    self.fetchPlaceCode(place, direction, callback);
  }, 5 * 60 * 1000);
};

module.exports = new SNCF();
