
var through = require('through2');
var should = require('should');
var dat = require('dat');
var async = require('async');

var vdat = require('..');

describe('src stream', function () {

  var srcPath = 'test/data/test-src';
  var fixtures = [
    { key: 'test-src-001', foo: 'bar' },
    { key: 'test-src-002', foo: 'bar' },
    { key: 'test-src-003', foo: 'bar' },
    { key: 'test-src-004', foo: 'bar' },
    { key: 'test-src-005', foo: 'bar' }
  ];

  beforeEach(function (done) {
    var db = dat(srcPath, function (err) {
      if (err) return done(err);
      db.destroy(function () {
        db = dat(srcPath, function (err) {
          if (err) return done(err);
          async.eachSeries(fixtures, function (fixture, next) {
            db.put(fixture, next);
          }, function (err) {
            db.close(done);
          });
        });
      });
    });
  });

  it('should be a stream', function (done) {
    var db = dat(srcPath, function (err) {
      if (err) return done(err);
      var input = vdat.src(db);
      should.exist(input.pipe);
      input.on('end', function() {
        db.close(done);
      });
    });
  });

  it('should read records as vinyl files from dat', function (done) {
    var db = dat(srcPath, function (err) {
      if (err) return done(err);
      var input = vdat.src(db);
      input.pipe(through.obj(function (file, en, next) {
        should.exist(file);
        should.exist(file.contents);
        this.push(file);
        next();
      }));
      input.on('end', function() {
        db.close(done);
      });
    });
  });

});

