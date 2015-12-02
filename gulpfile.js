var requireDir = require('require-dir'),
    gulp = require('gulp');

requireDir('./gulp/tasks');

gulp.task('default', [
  'resources',
  'styles',
  'gettext-compile',
  'html',
  'server',
  'watch'
]);

gulp.task('bundle', [
  'resources',
  'build',
  'styles',
  'gettext-compile',
  'html'
]);
