# GLAMOS – Glacier Monitoring in Switzerland

* Craft 3 Documentation: [Craft 3 Docs](https://docs.craftcms.com/v3/)
* Twig Template Language: [Twig Symfony](https://twig.symfony.com/doc/2.x/templates.html) [Twig Primer](https://docs.craftcms.com/v3/dev/twig-primer.html)

# Craft Templates

* All templates are separated according to the [Atomic Design Pattern](https://patternlab.io/)
* All pages with url's are found in `/templates/_pages` from there on all elements are split into includes. Its easiest to look for the include in `_pages` for orientation.
* All templates inherit `_layout.twig` so if you need global variables, put them there.
* There is a file called `_incl/docMacros.twig` which contain a few twig snippets. (eg. every wysiwyg field is sanitised trough a macro).
* SEO Code: All twig SEO is written in `_organisms/seoPage`. It grabs all the seo fields of each page and puts it into the head. If there are empty seo fields on a page it will grab the fallback text from `Globale Inhalte`
* Some Craft Entry IDs are hard-wired in the templates:
	- Main menu entries: in [_layout.twig](templates/_layout.twig)
	- Special direct buttons on Home page: in [indexOversight.twig](templates/_organisms/indexOversight.twig)

# Styles (SCSS)

* Stylesheets are also separated according to the [Atomic Design Pattern](https://patternlab.io/) (Although it doesn't work as nicely as in the twig markup)
* There is no Framework in place. It is all custom CSCC
* The stylesheet `IEhack.scss` is applied on IE 11 and contains all adjustments. Pleas place IE stuf only there.
* For npm package specific styling there is a `plugins.scss` for ugly overrides (e.g. Lightbox Plugin).

## SCSS Layouting

* All layouts are made with either grid or flexbox
* Each page has it's own grid stylesheet. They are suposed for layout mechanics only!!

# Translations
* Static translations in Craft are stored in the `translations` and then called in twig with the `t` Filter: `{{ 'Deine übersetzung' | t }}` [Static Translations](https://docs.craftcms.com/v3/static-translations.html#app)

# Install on your local environement

## Build

* on dev environements run: `npm i` once and then for development: `npm run dev`

## Custom environements

* Craft 3 uses [DOTENV](https://docs.craftcms.com/v3/config/environments.html) principle
* All custom vlaues are stored in a `.env` file which are applied into the files in `config`. The `.env` file mustn't be checked in because the whole idea is to not have any passwords in the repo. Just rename `.env-example` and adjust values accordingly

## Database

* copy the db from the specific server

## Ignored Files and folders

* Folders where CMS users can upload files trough the CMS are not in the repo. See `.gitignore` for said folders.


## Quick & Dirty Dev-Setup

npm run dev
cd www
php -S localhost:8000

