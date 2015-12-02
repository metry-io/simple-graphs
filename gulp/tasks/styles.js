var autoprefixer, config, gulp, less, rename;

gulp = require('gulp');
less = require('gulp-less');
autoprefixer = require('gulp-autoprefixer');
config = require('../config.json');
rename = require('gulp-rename');

gulp.task('styles', function() {
  return gulp.src(config.styles.main)
    .pipe(less())
    .pipe(autoprefixer(config.styles.autoprefixerOptions))
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest(config.dest.path));
});
