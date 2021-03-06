
var path = require('path');
var os = require('os');

var _ = require('lodash');
var dat = require('dat');
var through = require('through2');
var bops = require('bops');
var es = require('event-stream');

var vinylProps = [
  '_contents',
  'contents',
  'path',
  'cwd',
  'base',
  'stat',
  'isBuffer',
  'isStream',
  'isNull',
  'isDirectory',
  'clone',
  'pipe',
  'inspect'
];


/**
 * Write vinyl files to a `dat` database
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
 *       .pipe(...)
 *       // write changed records to same database
 *       .pipe(vdat.dest(db));
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
 * @param  {Object} `db`      instance of a `dat` database to write records to
 * @param  {Object} `options` additional options to pass to `data.createWriteStream()`
 * @return {Object} writable stream that will take vinyl files
 * @api public
 */

function dest (db, options) {
  if (!db) {
    throw new Error('db must be provided');
  }
  var opts = _.extend({}, options);

  var ws = db.createWriteStream(opts);
  var stream = through.obj(function (file, enc, callback) {
    if (isVinylFile(file)) {
      var data = JSON.parse(file.contents.toString());
      data = _.extend({ key: file.path }, _.omit(file, vinylProps), data);
      this.push(bops.from(JSON.stringify(data) + os.EOL));
      return callback();
    }
    this.push(bops.from(JSON.stringify(file) + os.EOL));
    callback();
  });

  return es.pipe(stream, ws);
}

function isVinylFile (file) {
  return file && file.isBuffer && file.isStream;
}

module.exports = dest;