<?php

// @codingStandardsIgnoreFile

/**
 * @file
 * Local development override configuration feature.
 *
 * To activate this feature, copy and rename it such that its path plus
 * filename is 'sites/default/settings.local.php'. Then, go to the bottom of
 * 'sites/default/settings.php' and uncomment the commented lines that mention
 * 'settings.local.php'.
 *
 * If you are using a site name in the path, such as 'sites/example.com', copy
 * this file to 'sites/example.com/settings.local.php', and uncomment the lines
 * at the bottom of 'sites/example.com/settings.php'.
 */

/**
 * Trusted host configuration.
 *
 * Drupal core can use the Symfony trusted host mechanism to prevent HTTP Host
 * header spoofing.
 *
 * To enable the trusted host mechanism, you enable your allowable hosts
 * in $settings['trusted_host_patterns']. This should be an array of regular
 * expression patterns, without delimiters, representing the hosts you would
 * like to allow.
 *
 * For example:
 *
 * @code
 * $settings['trusted_host_patterns'] = array(
 *   '^www\.example\.com$',
 * );
 * @endcode
 * will allow the site to only run from www.example.com.
 *
 * If you are running multisite, or if you are running your site from
 * different domain names (eg, you don't redirect http://www.example.com to
 * http://example.com), you should specify all of the host patterns that are
 * allowed by your site.
 *
 * For example:
 * @code
 * $settings['trusted_host_patterns'] = array(
 *   '^example\.com$',
 *   '^.+\.example\.com$',
 *   '^example\.org$',
 *   '^.+\.example\.org$',
 * );
 * @endcode
 * will allow the site to run off of all variants of example.com and
 * example.org, with all subdomains included.
 */
$settings['trusted_host_patterns'] = [ 'trusted_host_patterns_replacement' ];

/**
 * Configuration sync settings.
 */
$config_directories['sync'] = '../config/sync';
$settings['config_sync_directory'] = '../config/sync';
$config['config_split.config_split.local']['status'] = FALSE;
$config['config_split.config_split.local']['folder'] = '../config/splits/local';
$config['config_split.config_split.dev']['status'] = FALSE;
$config['config_split.config_split.dev']['folder'] = '../config/splits/dev';
$config['config_split.config_split.live']['status'] = TRUE;
$config['config_split.config_split.live']['folder'] = '../config/splits/live';

/**
 * Database settings
 */
$databases['default']['default'] = array(
  'database' => 'databasename',
  'username' => 'sqlusername',
  'password' => 'sqlpassword',
  'host' => 'databasehost',
  'port' => 'databaseport',
  'driver' => 'databasedriver',
  'prefix' => 'databaseprefix',
  'collation' => 'utf8mb4_general_ci',
);
