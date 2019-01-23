<?php

$vendorDir = dirname(__DIR__);

return array (
  'craftcms/redactor' => 
  array (
    'class' => 'craft\\redactor\\Plugin',
    'basePath' => $vendorDir . '/craftcms/redactor/src',
    'handle' => 'redactor',
    'aliases' => 
    array (
      '@craft/redactor' => $vendorDir . '/craftcms/redactor/src',
    ),
    'name' => 'Redactor',
    'version' => '2.1.6',
    'description' => 'Edit rich text content in Craft CMS using Redactor by Imperavi.',
    'developer' => 'Pixel & Tonic',
    'developerUrl' => 'https://pixelandtonic.com/',
    'developerEmail' => 'support@craftcms.com',
    'documentationUrl' => 'https://github.com/craftcms/redactor',
  ),
  'ether/seo' => 
  array (
    'class' => 'ether\\seo\\Seo',
    'basePath' => $vendorDir . '/ether/seo/src',
    'handle' => 'seo',
    'aliases' => 
    array (
      '@ether/seo' => $vendorDir . '/ether/seo/src',
    ),
    'name' => 'SEO',
    'version' => '3.4.4',
    'description' => 'SEO utilities including a unique field type, sitemap, & redirect manager',
    'developer' => 'Ether Creative',
    'developerUrl' => 'https://ethercreative.co.uk',
    'documentationUrl' => 'https://github.com/ethercreative/seo/blob/v3/README.md',
  ),
  'mmikkel/cp-clearcache' => 
  array (
    'class' => 'mmikkel\\cpclearcache\\CpClearCache',
    'basePath' => $vendorDir . '/mmikkel/cp-clearcache/src',
    'handle' => 'cp-clearcache',
    'aliases' => 
    array (
      '@mmikkel/cpclearcache' => $vendorDir . '/mmikkel/cp-clearcache/src',
    ),
    'name' => 'CP Clear Cache',
    'version' => '1.0.3',
    'description' => 'Less clickin’ to get clearin’',
    'developer' => 'Mats Mikkel Rummelhoff',
    'developerUrl' => 'https://vaersaagod.no',
    'documentationUrl' => 'https://github.com/mmikkel/CpClearCache-Craft/blob/master/README.md',
    'changelogUrl' => 'https://raw.githubusercontent.com/mmikkel/CpClearCache-Craft/master/CHANGELOG.md',
    'hasCpSettings' => false,
    'hasCpSection' => false,
  ),
  'enupal/translate' => 
  array (
    'class' => 'enupal\\translate\\Translate',
    'basePath' => $vendorDir . '/enupal/translate/src',
    'handle' => 'enupal-translate',
    'aliases' => 
    array (
      '@enupal/translate' => $vendorDir . '/enupal/translate/src',
    ),
    'name' => 'Enupal Translate',
    'version' => '1.1.6',
    'schemaVersion' => '1.0.0',
    'description' => 'Translate your website templates and plugins into multiple languages. Bulk translation with Google Translate or Yandex.',
    'developer' => 'Enupal',
    'developerUrl' => 'http://enupal.com/en',
    'developerEmail' => 'info@enupal.com',
    'documentationUrl' => 'https://enupal.com/en/craft-plugins/enupal-translate/docs',
    'components' => 
    array (
      'app' => 'enupal\\translate\\services\\App',
    ),
  ),
  'ostark/craft-async-queue' => 
  array (
    'class' => 'ostark\\AsyncQueue\\Plugin',
    'basePath' => $vendorDir . '/ostark/craft-async-queue/src',
    'handle' => 'async-queue',
    'aliases' => 
    array (
      '@ostark/AsyncQueue' => $vendorDir . '/ostark/craft-async-queue/src',
    ),
    'name' => 'AsyncQueue',
    'version' => '1.3.3',
    'description' => 'A queue handler that moves queue execution to a non-blocking background process',
    'developer' => 'Oliver Stark',
    'developerUrl' => 'https://www.fortrabbit.com',
    'changelogUrl' => 'https://raw.githubusercontent.com/ostark/craft-async-queue/master/CHANGELOG.md',
    'hasCpSettings' => false,
    'hasCpSection' => false,
  ),
);
