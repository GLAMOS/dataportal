<?php
/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here. You can see a
 * list of the available settings in vendor/craftcms/cms/src/config/GeneralConfig.php.
 *
 * @see craft\config\GeneralConfig
 */

return [
  // Global settings
  '*' => [
    'defaultWeekStartDay' => 1,
    'enableCsrfProtection' => true,
    'omitScriptNameInUrls' => true,
    'cpTrigger' => 'backstage',
    'securityKey' => getenv('SECURITY_KEY'),
  ],

  // Dev environment settings
  'glamos.local' => [
    'siteUrl' => getenv('SITE_URL'),
    'devMode' => true,
    'enableTemplateCaching' => false,
    'suppressTemplateErrors' => false,
  ],

  // Staging environment settings
  'staging' => [
    'siteUrl' => getenv('SITE_URL'),
  ],

  // Production environment settings
  'production' => [
    'siteUrl' => getenv('SITE_URL'),
  ],
];
