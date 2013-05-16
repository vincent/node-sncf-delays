var fs = require('fs');
var assert = require('assert');
var sncf = require('./index.js');

var html_table = fs.readFileSync('./fixtures/sncf_cdg_1_delay.html');

sncf.parseTable(html_table, 'test', function(err, delays){
  assert.ok(delays, 'Cannot extract delays from local html file');
  assert.ok(delays.length === 1,  'Cannot extract exactly one delay from local html file');
});

sncf.delaysAt('frmlw', 'dep', function(err, delays){
  assert.ok(!err);
  assert.ok(delays, 'Cannot extract delays from CDG remote table');
});

sncf.delaysAt("Aéroport CDG 2 TGV", "dep", function(err, delays){
  assert.ok(!err);
  assert.ok(delays, 'Cannot extract delays from CDG code remote table');
});
