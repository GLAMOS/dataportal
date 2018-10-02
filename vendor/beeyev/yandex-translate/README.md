# Yandex.Translate

[![Latest Version on Packagist][ico-version]][link-packagist]
[![Software License][ico-license]](LICENSE.md)
[![Total Downloads][ico-downloads]][link-downloads]

This system is like Bing Translator or Google translate, but api is free for use and without strict limits. API offers text translation features for over 30 languages. 


API reference in [English](https://tech.yandex.com/translate/doc/dg/concepts/api-overview-docpage/) / [Russian](https://tech.yandex.ru/translate/doc/dg/concepts/api-overview-docpage/)

Don't forget to [Get yor own API key](https://tech.yandex.com/key/form.xml?service=trnsl)

## Requirements

- PHP 5.3 or higher
- cURL

## Install

Via Composer

``` bash
$ composer require beeyev/yandex-translate
```

## Usage

``` php
use Beeyev\YaTranslate\Translate;

try {
    $tr = new Translate('yourApiKey');
    $result = $tr->translate("Hey baby, what are you doing tonight?", 'fr');
    
    echo $result;                           // Hey bébé, tu fais quoi ce soir?
    echo $result->sourceText();             // Hey baby, what are you doing tonight?
    echo $result->translationDirection();   // en-fr
    
    var_dump($result->translation());       // array (size=1)
                                            // 0 => string 'Hey bébé, tu fais quoi ce soir?'
} catch (\Beeyev\YaTranslate\TranslateException $e) {
    //Handle exception
}
```
## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

[ico-version]: https://img.shields.io/packagist/v/beeyev/yandex-translate.svg?style=flat-square
[ico-license]: https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square
[ico-downloads]: https://img.shields.io/packagist/dt/beeyev/yandex-translate.svg?style=flat-square

[link-packagist]: https://packagist.org/packages/beeyev/yandex-translate
[link-downloads]: https://packagist.org/packages/beeyev/yandex-translate
