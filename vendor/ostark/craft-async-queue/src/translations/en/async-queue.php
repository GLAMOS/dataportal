<?php
/**
 * AsyncQueue plugin for Craft CMS 3.x
 *
 * A queue handler that moves queue execution to a non-blocking background process
 *
 * @link      http://www.fortrabbit.com
 * @copyright Copyright (c) 2017 Oliver Stark
 */

/**
 * AsyncQueue en Translation
 *
 * Returns an array with the string to be translated (as passed to `Craft::t('async-queue', '...')`) as
 * the key, and the translation as the value.
 *
 * http://www.yiiframework.com/doc-2.0/guide-tutorial-i18n.html
 *
 * @author    Oliver Stark
 * @package   AsyncQueue
 * @since     1.0.0
 */
return [
    'AsyncQueue plugin loaded' => 'AsyncQueue plugin loaded',
    'Background process running' => 'Background process running',
    'Job status: {status}. Exit code: {code}' => 'Job status: {status}. Exit code: {code}',
    'Handling PushEvent for {job} job' => 'Handling PushEvent for {job} job',
];
