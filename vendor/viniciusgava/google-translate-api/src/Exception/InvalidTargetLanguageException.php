<?php

namespace GoogleTranslate\Exception;

/**
 * Google Translate API PHP Client
 *
 * @link https://github.com/viniciusgava/google-translate-php-client
 * @license http://www.gnu.org/copyleft/gpl.html
 * @version 2.0
 * @author Vinicius Gava (gava.vinicius@gmail.com)
 */
class InvalidTargetLanguageException extends InvalidLanguageException
{
    /** @inheritdoc */
    public function __construct(
        $message = 'Invalid target language',
        $code = 3,
        \Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
