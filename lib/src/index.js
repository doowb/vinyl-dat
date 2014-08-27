var path = require('path');
var os = require('os');

var _ = require('lodash');
var dat = require('dat');
var through = require('through2');
var es = require('event-stream');
var File = require('vinyl');
var bops = require('bops');


/**
 * Read records from a `dat` database as vinyl files.
 *
 * **Example**
 *
 * ```js
 * var dat = require('dat');
 * var vdat = require('vinyl-dat');
 *
 * // new gulp task with callback
 * gulp.task('demo', function (cb) {
 *
 *   // new dat database instance
 *   var db = dat('path/to/dat/database', function (err) {
 *     if (err) return cb(err);
 *
 *     // new stream from dat
 *     var stream = vdat.src(db)
 *       .pipe(...)
 *       .pipe(...)
 *       .pipe(...);
 *
 *     // use stream on end to close the database when finished
 *     stream.on('end', function () {
 *       db.close(cb);
 *     });
 *     
 *   });
 * });
 * ```
 * 
 * @param  {Object} `db`      instance of a `dat` database to read records from
 * @param  {Object} `options` additional options to pass to `data.createReadStream()`
 * @return {Object} readable stream that will pass database records through
 * @api public
 */

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
