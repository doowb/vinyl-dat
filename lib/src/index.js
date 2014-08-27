var path = require('path');
var os = require('os');

var _ = require('lodash');
var dat = require('dat');
var through = require('through2');
var es = require('event-stream');
var File = require('vinyl');
var bops = require('bops');

function src (db, options) {
  if (!db) {
    throw new Error('db must be provided');
  }
  var opts = _.extend({}, options);

  var rs = db.createReadStream(opts);
  var stream = through.obj(function (data, enc, callback) {
    var file = new File({
      path: data.key,
      contents: bops.from(JSON.stringify(data))
    });
    this.push(file);
    callback();
  });
  return es.pipe(rs, stream);
}

module.exports = src;
