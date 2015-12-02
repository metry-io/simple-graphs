var SERVER_PORT, browserSync, config, gulp;

gulp = require('gulp');
config = require('../config.json');
browserSync = require('browser-sync');

SERVER_PORT = 1337;

gulp.task('server', function() {
  var bs = browserSync.create();

  return bs.init({
    server: config.dest.path,
    files: config.dest.path + '/*',
    browser: 'google chrome'
  });
});
