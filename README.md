# README #

This README use markdown notation, for more info check [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### Drupal 8 site project ###

* Drupal 8 site with PhpStorm (Idea) and Ddev support
* Version 2.1

### Basic information ###

* As first step, make fork of this repository
    * more info on [link](https://confluence.atlassian.com/bitbucket/forking-a-repository-221449527.html)
    * and detailed information of complete process on [link](https://www.atlassian.com/git/tutorials/learn-about-code-review-in-bitbucket-cloud)
* all assignments should be pushed on forked repository
* at the end, when all assignments have been resolved and all tests passed, create a pull request from the forked repository
 (source) back to the original (destination)

* test site with be access locally at address http://drupal8.ddev.site if you set system With DDev Local as described bellow,
 or on http://drupal8.localhost if you set site manually.
* admin account:
```
user: admin
pass: admin1@3
```
* assignments for the test are in the section [Assignments](#assignments) in this document

### Set up environment ###
* Clone project from this git repo
* Update git submodules with commands:
```bash
git submodule init;
git submodule update;
```
* For easy usage of the project, you need to have installed [node](https://nodejs.org/en/) on your machine.
Please, check this with commands:
```bash
node --version
npm --version
npx --version
```
* In project root directory run `npm install` to install all needed package
* Project contains PhpStorm (IDEA) and Visual Code's configuration files, so you can just open with PhpStorm (IDEA) or Visual Code.
* You need to deploy project With DDev Local (Recommended) or Manually as described bellow

#### With DDev Local (Recommended) ####

* With DDev Local, your environment will be set up automatically. Otherwise, check manual installation section bellow.
* Documentation link https://ddev.readthedocs.io/en/stable/
* After installing DDev on a local computer, you can run project with following commands
```bash
ddev start
```
* First you need to import files folder with command
```bash
gulp import-files
```
* Then, you need to import initial database from .sql file with this command from project root directory
```bash
gulp import-db
```
* Install all needed package via _composer_
```bash
ddev composer install
```
* Now you can access project via url http://drupal8.ddev.site/
* When you finish work on project you can stop project (preserving database) with command
```bash
ddev stop
```
* If you want to remove project and database run this command (this will create database snapshot)
```bash
ddev delete
```
or without snapshot
```bash
ddev delete --omit-snapshot
```

#### Manual installation ####

* First you need to have installed some PHP environment, for example LAMP or XAMP or WAMP
* Create Apache virtual host and point root directory to public_html dir in project folder.
Here's setting for a virtual host, just replace <absolute-project-directory-location> for actual location

```
<VirtualHost *:80>
        # The ServerName directive sets the request scheme, hostname and port that
        # the server uses to identify itself. This is used when creating
        # redirection URLs. In the context of virtual hosts, the ServerName
        # specifies what hostname must appear in the request's Host: header to
        # match this virtual host. For the default virtual host (this file) this
        # value is not decisive as it is used as a last resort host regardless.
        # However, you must set it for any further virtual host explicitly.
        #ServerName www.example.com

        ServerAdmin webmaster@localhost
        DocumentRoot <absolute-project-directory-location>/public_html

        # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
        # error, crit, alert, emerg.
        # It is also possible to configure the loglevel for particular
        # modules, e.g.
        #LogLevel info ssl:warn

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        # For most configuration files from conf-available/, which are
        # enabled or disabled at a global level, it is possible to
        # include a line for only one particular virtual host. For example the
        # following line enables the CGI configuration for this host only
        # after it has been globally disabled with "a2disconf".
        #Include conf-available/serve-cgi-bin.conf

        # Directory settings.
        ServerName drupal8.localhost
        <Directory <absolute-project-directory-location>/public_html/>
          Options +Indexes +FollowSymLinks +MultiViews +Includes
          AllowOverride All
          Order allow,deny
          allow from all
        </Directory>
</VirtualHost>
```

* Add following into `/etc/hosts` file (Linux), for Windows check this [link](https://www.thewindowsclub.com/hosts-file-in-windows)
```
127.0.0.1       drupal8.localhost
```
* Create a database and import initial version from the directory `<PROJECT-ROOT>/bk/db/`
* Copy "files" folder from `<PROJECT-ROOT>/bk/` into `<PROJECT-ROOT>/public_html/sites/default/`
* Copy "settings.php" file from `<PROJECT-ROOT>/bk/` into `<PROJECT-ROOT>/public_html/sites/default/`
* Change your Drupal settings.php file to use your database
* Install all needed package via _composer_
```bash
composer install
```
* Now you can access site from url
```
drupal8.localhost
```
* Clean Drupal cache, and you can start using site.


### Contribution guidelines ###

* Netbeans' configuration for this project contains formatting settings. For good code formating
just press Alt+Shift+F shortcut or right mouse click on document and click on "Format" item.
You can find detailed instructions on https://www.drupal.org/docs/develop/development-tools/configuring-netbeans
* Create new Git flow feature for any task (https://www.atlassian.com/git/tutorials/comparing-workflows)
* When finish the work complete git feature (always use rebase, not merge). Everything should be rebased and merged into develop branch.
* Push develop branch to Bitbucket.
* Changes will be automatically applied to test server.

#### Export configuration ####
You need to use standard Drupal 8 Configuration manager and export feature with drush (you need drush >=9.0.0)
You can see safe way to do that with [Config Split module](https://www.drupal.org/docs/8/modules/configuration-split)

Here is the video how to do that in safe way
https://youtu.be/WsMuQFO8yGU?t=28m30s
```bash
drush csex;
git add && git commit;
git pull;
composer install;
drush updb;
drush csim;
git push;
```

_This is mostly for Drupa 7 info, but there are some things also for Drupal 8._
More detailed info about deploying you can find here https://www.drupal.org/node/803746

> _Using Features module is deprecated in Drupal 8. It should be use only for development purpose._
> If you need to export some configurations to git, you need to use Features module.
> More info about that:
>
> * Drupal's module [Featrues Module](https://www.drupal.org/project/features)
> * Instruction [How to use](https://www.slideshare.net/svilensabev/building-and-deployment-of-drupal-sites-with-features-and-context-6696247)
> * And [video](https://www.youtube.com/watch?v=MoMS8Z3Wp2o)

#### Install new module ####
You can install a new module using composer and drush with following commands (in this example we will use _coffee_ module)
```bash
ddev composer require drupal/coffee;
```
and enable the module via drush
```bash
ddev exec drush en coffee;
```

#### Upgrade Drupal core ####
https://www.drupal.org/docs/updating-drupal/updating-drupal-core-via-composer
Run following command:
```bash
ddev composer update drupal/core-recommended --with-dependencies
```
Also, you can update all modules (if you only want security update, you first need to get
list of that modules via drush command - see command bellow, composer doesn't know for security updates, and after
that to update list of these modules via composer)
```bash
ddev composer update drupal/* --with-dependencies
```

Get list of modules with security update
```bash
ddev exec drush sec
```

#### Useful command ####
Backup database
```bash
ddev export-db --file /tmp/db.sql.gz
```

Made database snapshot
```bash
ddev snapshot
```
and restore it
```bash
ddev restore-snapshot d8git_20180801132403
```

To generate custom Drupal _hash_salt_, login to ddev container with command `ddev ssh`
and run following drush command (_do not use `ddev exec` for this, it will not work_):
```bash
drush php-eval 'echo \Drupal\Component\Utility\Crypt::randomBytesBase64(55) . "\n";'
```

#### Run tests ####
First you need to creat _phpunit.xml_ file in project root. Here's initial version of it
```xml
<?xml version="1.0" encoding="UTF-8"?>

<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="http://schema.phpunit.de/4.1/phpunit.xsd"
         backupGlobals="false"
         colors="true"
         bootstrap="vendor/weitzman/drupal-test-traits/src/bootstrap.php"
         verbose="true"
        >
    <php>
        <env name="DTT_BASE_URL" value="http://web"/>
        <env name="DTT_API_URL" value="http://web:9222"/>
        <env name="DTT_MINK_DRIVER_ARGS" value='["firefox", null, "http://chromedriver:4444/wd/hub"]'/>
        <!-- Example BROWSERTEST_OUTPUT_DIRECTORY value: /tmp/b2b
             Specify a temporary directory for storing debug images and html documents.
             These artifacts get copied to /sites/simpletest/browser_output by BrowserTestBase -->
        <env name="BROWSERTEST_OUTPUT_DIRECTORY" value="./tests/output"/>
        <env name="SYMFONY_DEPRECATIONS_HELPER" value="disabled"/>
    </php>
    <testsuites>
        <testsuite name="basic-functional">
            <directory>./tests/src/Functional/</directory>
        </testsuite>
    </testsuites>
</phpunit>
```

To run tests, you need to login to web docker container with following command
```bash
ddev ssh
```
then in php container, go to the folder /var/www/html
```bash
cd /var/www/html
```
and run tests with command
```bash
vendor/bin/phpunit
```

#### Run tests on Bitbucket pipelines
* First you need to enable Bitbucket pipelines on your Bitbucket cloud
    * https://confluence.atlassian.com/bitbucket/get-started-with-bitbucket-pipelines-792298921.html
    * bitbucket-pipelines.yml file is already created, so you need just to click on Enable button
* After that you can run test for each assignment
    * https://confluence.atlassian.com/bitbucket/run-pipelines-manually-861242583.html
* IMPORTANT: If you use Bitbucket free account, you only have 50 free minutes per month for pipelines builds

#### Compile Boostrap 4 sub-theme
* If site use Boostrap 4 theme based on [Barrio SASS](https://www.drupal.org/project/bootstrap_sass) you can use following command to compile it:
```bash
ddev ssh;
cd themes/custom/custom_theme_dir/;
npm run gulp;
```
* At the end use _Ctrl+C_ to stop watch and compile started with command above

#### Run cron with drush on sharred hosting
```bash
10 * * * * cd [DOCROOT] && /usr/bin/env PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin COLUMNS=72 ../vendor/bin/drush --uri=your.drupalsite.org --quiet cron
```

### Who do I talk to? ###

* For more information contact office@sakiland.org
