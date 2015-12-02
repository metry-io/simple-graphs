var config, gulp, htmlmin;
gulp = require('gulp');
htmlmin = require('gulp-htmlmin');
config = require('../config.json');

gulp.task('html', function() {
  return gulp.src(config.html.main)
  .pipe(htmlmin({
    collapseWhitespace: true
  }))
  .pipe(gulp.dest(config.dest.path));
});
