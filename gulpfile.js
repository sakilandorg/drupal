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

gulp.task('enable-develop-mode', function () {
  return run('ddev exec drupal site:mode dev', {}).exec();
})

gulp.task('disable-develop-mode', function () {
  return run('ddev exec drupal site:mode prod', {}).exec();
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
      'ssh-keyscan -H bitbucket.org >> ~/.ssh/known_hosts',
      'chmod 644 ~/.ssh/known_hosts',
      'ssh -T git@bitbucket.org',
      'git config --global alias.co checkout',
      'git config --global alias.br branch',
      'git config --global alias.ci commit',
      'git config --global alias.st status',
      'git config --global alias.lg \'log --graph --date-order -C -M --pretty=format:"<%h> %ad [%an] %Cgreen%d%Creset %s" --all --date=short\''
    ], {filePath: 'set-server.log'})
    .on('ssh2Data', function (data) {
      console.log("" + data)
    })
    .pipe(gulp.dest('logs'))
})

gulp.task('deploy-initial-production-site', gulp.series(
  function () {
    return gulpSSH
      .shell([
        'cd ' + customVariables.PRODUCTION.PROJECT_ROOT,
        'pwd',
        'ls -al ' + customVariables.PRODUCTION.PROJECT_WEBROOT,
        'rm -fr ' + customVariables.PRODUCTION.PROJECT_WEBROOT + '/*',
        'find ' + customVariables.PRODUCTION.PROJECT_WEBROOT + ' \\( -iname ".*" ! -iname "." ! -iname ".well-known" \\) -exec rm -rf "{}" \\;',
        'ls -al ' + customVariables.PRODUCTION.PROJECT_WEBROOT,
        'rm -fr .ddev .git .idea bk config drush private scripts vendor',
        'rm -f .editorconfig .git-ftp-ignore .gitattributes .gitignore README.md composer.json composer.lock gulpfile.js package-lock.json package.json',
        'git init',
        'git status',
        'git remote add -f origin ' + customVariables.PRODUCTION.GIT,
        'git checkout ' + customVariables.PRODUCTION.GIT_BRANCH,
        'git pull origin ' + customVariables.PRODUCTION.GIT_BRANCH,
        'git submodule init',
        'git submodule update'
      ], {filePath: 'deploy-initial-site.log'})
      .on('ssh2Data', function (data) {
        console.log("" + data)
      })
      .pipe(gulp.dest('logs'))
  },
  function () {
    return gulpSSH
      .shell([
        'cd ' + customVariables.PRODUCTION.PROJECT_ROOT,
        'composer install --no-dev'
      ], {filePath: 'deploy-initial-site-composer.log'})
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
      .pipe(replace('hash_salt_replacement', customVariables.PRODUCTION.HASH_SALT))
      .pipe(replace(/'trusted_host_patterns_replacement'/, function () {
        let escapedDomain = customVariables.PRODUCTION.DOMAIN.replace('.', '\\.');
        return "'^" + escapedDomain + "$', 'www\\." + escapedDomain + "$'"
      }))
      .pipe(rename('settings.local.php'))
      .pipe(gulpSSH.dest(customVariables.PRODUCTION.PROJECT_WEBROOT + '/sites/default/'))
  },
  function () {
    return gulp.src('bk/db/drupal.sql.gz')
      .pipe(gulpSSH.dest(customVariables.PRODUCTION.PROJECT_ROOT + '/tmp-initial/db/'))
  },
  function () {
    return gulpSSH
      .shell([
        'cd ' + customVariables.PRODUCTION.PROJECT_ROOT,
        'cp -vr ./bk/files ./public_html/sites/default/',
        'gunzip < ' + customVariables.PRODUCTION.PROJECT_ROOT + '/tmp-initial/db/drupal.sql.gz | ./vendor/bin/drush sqlc',
        './vendor/bin/drush cr',
        'rm -fr ' + customVariables.PRODUCTION.PROJECT_ROOT + '/tmp-initial'
      ], {filePath: 'deploy-initial-site-2.log'})
      .on('ssh2Data', function (data) {
        console.log("" + data)
      })
      .pipe(gulp.dest('logs'))
  }
))

gulp.task('deploy-initial-test-site', gulp.series(
  function () {
    return gulpSSH
      .shell([
        'cd ' + customVariables.TEST.PROJECT_ROOT,
        'pwd',
        'ls -al ' + customVariables.TEST.PROJECT_WEBROOT,
        'rm -fr ' + customVariables.TEST.PROJECT_WEBROOT + '/*',
        'find ' + customVariables.TEST.PROJECT_WEBROOT + ' \\( -iname ".*" ! -iname "." ! -iname ".well-known" \\) -exec rm -rf "{}" \\;',
        'ls -al ' + customVariables.TEST.PROJECT_WEBROOT,
        'rm -fr .ddev .git .idea bk config drush private scripts vendor',
        'rm -f .editorconfig .git-ftp-ignore .gitattributes .gitignore README.md composer.json composer.lock gulpfile.js package-lock.json package.json',
        'git init',
        'git status',
        'git remote add -f origin ' + customVariables.TEST.GIT,
        'git checkout ' + customVariables.TEST.GIT_BRANCH,
        'git pull origin ' + customVariables.TEST.GIT_BRANCH,
        'git submodule init',
        'git submodule update'
      ], {filePath: 'deploy-initial-site.log'})
      .on('ssh2Data', function (data) {
        console.log("" + data)
      })
      .pipe(gulp.dest('logs'))
  },
  function () {
    return gulpSSH
      .shell([
        'cd ' + customVariables.TEST.PROJECT_ROOT,
        'composer install --no-dev'
      ], {filePath: 'deploy-initial-site-composer.log'})
      .pipe(gulp.dest('logs'))
  },
  function () {
    return gulp.src('bk/test.settings.local.php')
      .pipe(replace('databasename', customVariables.TEST.DATABASE.NAME))
      .pipe(replace('sqlusername', customVariables.TEST.DATABASE.USERNAME))
      .pipe(replace('sqlpassword', customVariables.TEST.DATABASE.PASSWORD))
      .pipe(replace('databasehost', customVariables.TEST.DATABASE.HOST))
      .pipe(replace('databaseport', customVariables.TEST.DATABASE.PORT))
      .pipe(replace('databasedriver', customVariables.TEST.DATABASE.DRIVER))
      .pipe(replace('databaseprefix', customVariables.TEST.DATABASE.PREFIX))
      .pipe(replace('hash_salt_replacement', customVariables.TEST.HASH_SALT))
      .pipe(replace(/'trusted_host_patterns_replacement'/, function () {
        let escapedDomain = customVariables.TEST.DOMAIN.replace('.', '\\.');
        return "'^" + escapedDomain + "$', 'www\\." + escapedDomain + "$'"
      }))
      .pipe(rename('settings.local.php'))
      .pipe(gulpSSH.dest(customVariables.TEST.PROJECT_WEBROOT + '/sites/default/'))
  },
  function () {
    return gulp.src('bk/db/drupal.sql.gz')
      .pipe(gulpSSH.dest(customVariables.TEST.PROJECT_ROOT + '/tmp-initial/db/'))
  },
  function () {
    return gulpSSH
      .shell([
        'cd ' + customVariables.TEST.PROJECT_ROOT,
        'cp -vr ./bk/files ./public_html/sites/default/',
        'gunzip < ' + customVariables.TEST.PROJECT_ROOT + '/tmp-initial/db/drupal.sql.gz | ./vendor/bin/drush sqlc',
        './vendor/bin/drush cr',
        'rm -fr ' + customVariables.TEST.PROJECT_ROOT + '/tmp-initial'
      ], {filePath: 'deploy-initial-site-2.log'})
      .on('ssh2Data', function (data) {
        console.log("" + data)
      })
      .pipe(gulp.dest('logs'))
  }
))
