var config, gulp;
gulp = require('gulp');
config = require('../config.json');

gulp.task('resources', function() {
  return gulp.src(config.resources.main)
  .pipe(gulp.dest(config.dest.path));
});
