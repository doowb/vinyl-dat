
var through = require('through2');
var should = require('should');
var dat = require('dat');
var File = require('vinyl');
var bops = require('bops');

var vdat = require('..');

describe('dest stream', function () {

  var destPath = 'test/data/test-dest';

  beforeEach(function (done) {
    var db = dat(destPath, function (err) {
      if (err) return done(err);
      db.destroy(done);
    });
  });

  it('should be a stream', function (done) {
    var db = dat(destPath, function (err) {
      if (err) return done(err);
      var output = vdat.dest(db);
      should.exist(output.pipe);
      output.on('end', function () {
        db.close(done);
      });
      output.write({foo: 'bar'});
      output.end();
    });
  });

  it('should write a vinyl file to dat', function (done) {
    var expected = new File({
      path: 'test-001',
      contents: bops.from(JSON.stringify({foo: 'bar'}))
    });

    var db = dat(destPath, function (err) {
      if (err) return done(err);
      var output = vdat.dest(db);
      output.on('end', function () {
        db.get('test-001', function (err, record) {
          if (err) done(err);
          should.exist(record);
          should.exist(record.version);
          record.version.should.eql(1);

          db.close(done);
        });
      });

      output.write(expected);
      output.end();
    });
  });

});

