var browserify, buffer, collapse, config, gulp, gutil, source, uglify;
gulp = require('gulp');
browserify = require('browserify');
source = require('vinyl-source-stream');
config = require('../config.json');
collapse = require('bundle-collapser/plugin');
gutil = require('gulp-util');
buffer = require('vinyl-buffer');
uglify = require('gulp-uglify');

gulp.task('build', function() {
  var b = browserify({
    entries: [config.scripts.main],
    debug: false
  });

  b.plugin(collapse);
  b.transform('browserify-plain-jade');
  b.transform('browserify-ngannotate', {
    ext: '.js'
  });
  b.transform('uglifyify');

  return b.bundle()
    .pipe(source(config.scripts.targetName))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(config.dest.path));
});

