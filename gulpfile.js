const customVariables = require('./scripts/private-variables.json')

const gulp = require('gulp');
const fs = require('fs');
const dirSync = require('gulp-directory-sync');
const run = require('gulp-run');
const GulpSSH = require('gulp-ssh');
const replace = require('gulp-replace');
const rename = require('gulp-rename');

gulp.task('info', function () {
  return run('ddev describe', {}).exec();
});

gulp.task('check-config-changes', function () {
  return run('ddev exec drush cst', {}).exec();
})

gulp.task('export-config-changes', function () {
  return run('ddev exec drush cex', {}).exec();
})

gulp.task('import-database', function () {
  return run('ddev import-db --src ./bk/db/drupal.sql.gz', {}).exec();
})

gulp.task('export-database', function () {
  return run('ddev export-db --file ./bk/db/drupal.sql.gz', {}).exec();
  // return run('ddev exec drush sql:dump --result-file=./bk/db/drupal.sql --gzip').exec();
})

gulp.task('import-files', function () {
  return run('ddev import-files --src=./bk/files', {}).exec();
})

gulp.task('export-files', function () {
  return gulp.src('./')
    .pipe(dirSync('public_html/sites/default/files', 'bk/files', {
      printSummary: true,
      ignore: [
        'css',
        'ctools',
        'js',
        'styles',
        'sync',
        'php',
        'translations'
      ]
    }))
})

/*
  These are remotes tasks. To work, you need to have appropriate ssh private key.
 */
const config = {
  host: customVariables.PRODUCTION.SSH_URL,
  port: customVariables.PRODUCTION.SSH_PORT,
  username: customVariables.PRODUCTION.SSH_USERNAME,
  privateKey: fs.readFileSync(customVariables.PRODUCTION.PRIVATE_KEY_PATH)
}

const gulpSSH = new GulpSSH({
  ignoreErrors: false,
  sshConfig: config
})

gulp.task('set-server', function () {
  return gulpSSH
    .shell([
      'ssh -T git@bitbucket.org'
    ], {filePath: 'set-server.log'})
    .on('ssh2Data', function (data) {
      console.log("" + data)
    })
    .pipe(gulp.dest('logs'))
})

gulp.task('deploy-initial-site', gulp.series(
  function () {
    return gulpSSH
      .shell([
        'cd ' + customVariables.PRODUCTION.PROJECT_ROOT,
        'pwd',
        'ssh-keyscan -H bitbucket.org >> ~/.ssh/known_hosts',
        'chmod 644 ~/.ssh/known_hosts',
        'ls -al ' + customVariables.PRODUCTION.PROJECT_WEBROOT,
        'rm -fr ' + customVariables.PRODUCTION.PROJECT_WEBROOT + '/*',
        'ls -al ' + customVariables.PRODUCTION.PROJECT_WEBROOT,
        'rm -fr .git',
        'rm -f .gitignore',
        'git init',
        'git status',
        'git remote add -f origin ' + customVariables.PRODUCTION.GIT,
        'git checkout ' + customVariables.PRODUCTION.GIT_BRANCH,
        'git pull origin ' + customVariables.PRODUCTION.GIT_BRANCH,
        'git submodule init',
        'git submodule update',
        'composer install --no-dev'
      ], {filePath: 'deploy-initial-site.log'})
      .on('ssh2Data', function (data) {
        console.log("" + data)
      })
      .pipe(gulp.dest('logs'))
  },
  function () {
    return gulp.src('bk/production.settings.local.php')
      .pipe(replace('databasename', customVariables.PRODUCTION.DATABASE.NAME))
      .pipe(replace('sqlusername', customVariables.PRODUCTION.DATABASE.USERNAME))
      .pipe(replace('sqlpassword', customVariables.PRODUCTION.DATABASE.PASSWORD))
      .pipe(replace('databasehost', customVariables.PRODUCTION.DATABASE.HOST))
      .pipe(replace('databaseport', customVariables.PRODUCTION.DATABASE.PORT))
      .pipe(replace('databasedriver', customVariables.PRODUCTION.DATABASE.DRIVER))
      .pipe(replace('databaseprefix', customVariables.PRODUCTION.DATABASE.PREFIX))
      .pipe(replace(/'trusted_host_patterns_replacement'/, function () {
        let escapedDomain = customVariables.PRODUCTION.DOMAIN.replace('.', '\\.');
        return "'^" + escapedDomain + "$', 'www\\." + escapedDomain + "$'"
      }))
      .pipe(gulpSSH.sftp('write', customVariables.PRODUCTION.PROJECT_WEBROOT + '/sites/default/settings.local.php'))
  },
  function () {
    return gulp.src('bk/db/drupal.sql.gz')
      .pipe(gulpSSH.sftp('write', customVariables.PRODUCTION.PROJECT_ROOT + '/tmp-initial/db/drupal.sql.gz'))
  },
  function () {
    return gulp.src('bk/files/')
      .pipe(gulpSSH.sftp('write', customVariables.PRODUCTION.PROJECT_WEBROOT + '/sites/default/files/'))
  },
  function () {
    return gulpSSH
      .shell([
        'cd ' + customVariables.PRODUCTION.PROJECT_WEBROOT,
        'gunzip < ' + customVariables.PRODUCTION.PROJECT_ROOT + '/tmp-initial/db/drupal.sql.gz | drush sqlc',
        'drush cr'
      ], {filePath: 'deploy-initial-site-2.log'})
      .on('ssh2Data', function (data) {
        console.log("" + data)
      })
      .pipe(gulp.dest('logs'))
  }
))

gulp.task('test-ssh', function () {
  return gulpSSH
    .exec(['ls -al'], {})
    .on('ssh2Data', function (data) {
      console.log('STDOUT: ' + data)
    })
})

gulp.task('test-rep', function () {
  return gulp.src('bk/production.settings.local.php')
    .pipe(replace('databasename', customVariables.PRODUCTION.DATABASE.NAME))
    .pipe(replace('sqlusername', customVariables.PRODUCTION.DATABASE.USERNAME))
    .pipe(replace('sqlpassword', customVariables.PRODUCTION.DATABASE.PASSWORD))
    .pipe(replace('databasehost', customVariables.PRODUCTION.DATABASE.HOST))
    .pipe(replace('databaseport', customVariables.PRODUCTION.DATABASE.PORT))
    .pipe(replace('databasedriver', customVariables.PRODUCTION.DATABASE.DRIVER))
    .pipe(replace('databaseprefix', customVariables.PRODUCTION.DATABASE.PREFIX))
    .pipe(replace(/'trusted_host_patterns_replacement'/, function () {
      let escapedDomain = customVariables.PRODUCTION.DOMAIN.replace('.', '\\.');
      return "'^" + escapedDomain + "$', 'www\\." + escapedDomain + "$'"
    }))
    .pipe(rename('settings.local.php'))
    .pipe(gulp.dest('build/'));
})

