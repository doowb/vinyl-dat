
var through = require('through2');
var should = require('should');
var dat = require('dat');
var async = require('async');

var vdat = require('..');

describe('src dest piping', function () {

  var srcPath = 'test/data/test-src-dest/src';
  var destPath = 'test/data/test-src-dest/dest';

  var fixtures = [
    { key: 'test-src-dest-001', foo: 'bar' },
    { key: 'test-src-dest-002', foo: 'bar' },
    { key: 'test-src-dest-003', foo: 'bar' },
    { key: 'test-src-dest-004', foo: 'bar' },
    { key: 'test-src-dest-005', foo: 'bar' }
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

  it('should change records and save', function (done) {
    var db = dat(srcPath, function (err) {
      if (err) return done(err);
      var input = vdat.src(db)
        .pipe(through.obj(function (file, en, next) {
          var data = JSON.parse(file.contents.toString());
          data.foo = 'baz';
          file.contents = new Buffer(JSON.stringify(data));
          this.push(file);
          next();
        }))
        .pipe(vdat.dest(db));

      input.on('end', function() {
        db.get('test-src-dest-001', function (err, file) {
          if (err) return done(err);
          should.exist(file);
          should.exist(file.foo);
          file.foo.should.eql('baz');
          db.close(done);
        });
      });
    });
  });

  it('should change records and save in another database', function (done) {
    var srcDB = dat(srcPath, function (err) {
      if (err) return done(err);
      var destDB = dat(destPath, function (err) {
        if (err) return done(err);

        var input = vdat.src(srcDB)
          .pipe(through.obj(function (file, en, next) {
            var data = JSON.parse(file.contents.toString());
            data.foo = 'baz';
            file.contents = new Buffer(JSON.stringify(data));
            this.push(file);
            next();
          }))
          .pipe(vdat.dest(destDB));

        input.on('end', function() {
          srcDB.get('test-src-dest-001', function (err, file) {
            if (err) return done(err);
            should.exist(file);
            should.exist(file.foo);
            file.foo.should.eql('bar');
            destDB.get('test-src-dest-001', function (err, file) {
              if (err) return done(err);
              should.exist(file);
              should.exist(file.foo);
              file.foo.should.eql('baz');
              srcDB.close(function () {
                destDB.close(done);
              });
            });
          });
        });
      });
    });
  });


});

