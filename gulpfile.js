const gulp = require('gulp');
const run = require('gulp-run');

gulp.task('info', function () {
  return run('ddev describe').exec();
});

gulp.task('check-config-changes', function () {
  return run('ddev exec drush cst').exec();
})

gulp.task('export-config-changes', function () {
  return run('ddev exec drush cex').exec();
})

gulp.task('import-database', function () {
  return run('ddev import-db --src ./bk/db/drupal.sql.gz').exec();
})

gulp.task('export-database', function () {
  return run('ddev export-db --file ./bk/db/drupal.sql.gz').exec();
})

gulp.task('import-files', function () {
  return run('ddev import-files --src=./bk/files').exec();
})
