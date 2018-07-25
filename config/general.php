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
    'siteUrl' => [
        'glamosDe' => getenv('SITE_URL_DE'),
        'glamosFr' => getenv('SITE_URL_EN'),
        'glamosEn' => getenv('SITE_URL_FR'),
        'glamosIt' => getenv('SITE_URL_IT'),
    ],
  ],

  // Dev environment settings
  'dev' => [
    'devMode' => true,
    'enableTemplateCaching' => false,
    'suppressTemplateErrors' => false,
  ],

  // Staging environment settings
  'staging' => [
  ],

  // Production environment settings
  'production' => [
  ],
];
