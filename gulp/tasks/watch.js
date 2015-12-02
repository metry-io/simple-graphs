var assign, b, browserify, buffer, bundle, config, customOpts, gulp, gutil, opts, source, sourcemaps, watchify;
gulp = require('gulp');
config = require('../config.json');
assign = require('lodash.assign');
browserify = require('browserify');
watchify = require('watchify');
gutil = require('gulp-util');
buffer = require('vinyl-buffer');
source = require('vinyl-source-stream');
sourcemaps = require('gulp-sourcemaps');

customOpts = {
  entries: [config.scripts.main],
  debug: true
};

opts = assign({}, watchify.args, customOpts);

b = watchify(browserify(opts));
b.transform('browserify-plain-jade');

bundle = function() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.dest.path));
};

gulp.task('browserify', bundle);

gulp.task('watch_scripts', ['browserify'], function() {
  b.on('update', bundle);
  return b.on('log', gutil.log);
});

gulp.task('watch_html', function() {
  return gulp.watch([config.html.main], ['html']);
});

gulp.task('watch_styles', function() {
  return gulp.watch([config.styles.all], ['styles']);
});

gulp.task('watch_resources', function() {
  return gulp.watch([config.resources.main], ['resources']);
});

gulp.task('watch_translations', function() {
  return gulp.watch([config.translations.compile.source], ['gettext-compile']);
});

gulp.task('watch', [
  'watch_scripts',
  'watch_html',
  'watch_styles',
  'watch_translations',
  'watch_resources'
]);
