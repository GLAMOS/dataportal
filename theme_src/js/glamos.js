import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import c3 from 'c3';

import ieDetector from '@kspr/gugus-ie-detector';
ieDetector();

import controller from './controller';

import './map/map.js';

global.my = {};

(function (global, $) {
  /* TODO: Done in PHP now; keep for library until clean-up */
  // function clone (orig, props)
  // {
  //   const CLONE = Object.create(Object.getPrototypeOf(orig));
  //   Object.keys(orig).forEach((key) => { CLONE[key] = orig[key]; });
  //   if (props) Object.keys(props).forEach((key) => { CLONE[key] = props[key]; });
  //   return CLONE;
  // }

  /* TODO: Useful if we can get dates for time series */
  // function getDate (dateString)
  // {
  //   return dateString.replace(/\//g, '-');
  // }

  function formatNumber (value)
  {
    return String(value).replace('-', '&minus;');
  }

  let chart;

  controller.bridge({
    loadGlacierData (ids) {
      const DATA_SOURCE = {
        length_change: {
          URI: '/glacier-data.php?type=length_change&id='  // '/geo/griessgletscher_length_change.geojson',
        },
        mass_balance: {
          URI: '/glacier-data.php?type=mass_balance&id='   // '/geo/griessgletscher_mass_change.geojson'
        }
      };

      /* TODO: Write a fetch API wrapper */
      // fetch(URI)
      // .then((response) => response.json())
      // .then((json) => {
      // }

      /* DEBUG */
      // console.log(`IDs: ${ids}`);

      const KEY_YEAR = 'year';
      const KEY_NAME = 'glacier_full_name';
      const CHART_CONFIG = {
        bindto: '#chart',
        axis: {
          x: {
            tick: {
              // format: '%Y', //-%m-%d'
              outer: false,
              rotate: 45
            },
            // type: 'timeseries',
          },
          y: {
            label: {
              position: 'outer',
              text: 'Kumulative Längenänderung (m)',
            },
            tick: {
              outer: false,
            }
          }
        },
        grid: {
          y: { show: true },
          x: { show: true }
        },
        tooltip: {
          format: {
            value (value) { return `${formatNumber(value)}\xA0m`; }
          }
        }
      };

      const SELECT_TYPE = document.getElementById('chart_param');
      const DATA_TYPE = SELECT_TYPE.options[SELECT_TYPE.selectedIndex].value;

      for (let i = 0, len = ids.length; i < len; ++i)
      {
        const xhr = new XMLHttpRequest();
        const id = ids[i];

        xhr.open('GET', DATA_SOURCE[DATA_TYPE].URI + id, true);

        let loaded = false;
        const onload = function (ev) {
          if (loaded) return;
          loaded = true;

          const JSON_DATA = JSON.parse(ev.target.responseText);

          if (JSON_DATA && JSON_DATA.length > 0)
          {
            const YEARS = [KEY_YEAR].concat(JSON_DATA.map((entry) => entry.year));
            const VALUES = [id].concat(JSON_DATA.map((entry) => entry.value));
            const LINE_LABEL = JSON_DATA[0][KEY_NAME];
            const CHART_DATA = {
              x: KEY_YEAR,
              columns: [YEARS, VALUES],
              names: {
                [id]: LINE_LABEL
              }
            };

            /* DEBUG */
            console.log(JSON_DATA);
            console.log(CHART_DATA);

            if (!chart)
            {
              CHART_CONFIG.data = CHART_DATA;
              chart = c3.generate(CHART_CONFIG);
            }
            else
            {
              chart.load(CHART_DATA);
            }
          }
          else
          {
            /* TODO: Display message only if there are no data at all, without breaking the chart */
            // document.getElementById('chart').innerHTML = 'Keine Daten verfügbar.';
          }
        };

        xhr.onload = onload;
        xhr.onreadystatechange = function () {
          if (loaded) return;

          if (xhr.readyState == 4 && xhr.status === 200)
          {
            onload({target: xhr});
          }
        };
        xhr.send(null);
      }
    },
    unloadGlacierData (id) {
      chart.unload({ids: [id]});
    }
  });

  function getAvailableDownloadTabs () {
    return $('.tabContainer a[data-tab]').map((_ix, el) => el.getAttribute('data-tab'));
  }
  controller.bridge({getAvailableDownloadTabs});

  function selectDownloadTab (TAB_ID) {
    const CLASS_NAME = 'current';
    $('ul.tabLinks a').removeClass(CLASS_NAME);
    $('.tabPanel').removeClass(CLASS_NAME);

    $(`a[data-tab="${TAB_ID}"]`).addClass(CLASS_NAME);
    $(`#${TAB_ID}`).addClass(CLASS_NAME);
  }
  controller.bridge({selectDownloadTab});

  $(document).ready(function () {
    /* Initialize menu for mobiles */
    $('#mainMobileNav').mmenu();

    /* Initialize map viewer menu */
    $('#navMapViewer').mmenu({
      navbar: false,
      extensions: ['position-right']
    });

    /* Add active class to ancestor if link is in dropdown */
    $('.active').parent().closest('.dropDown').addClass('active');

    /* initializes the single preview image lightbox */
    $('.imgGallery').lightGallery({
      selector: '.zoomItem',
      download: false
    });

    /* Initialize download tabs */
    $('ul.tabLinks a').on('click', function (ev) {
      ev.preventDefault();
      const TAB_ID = $(this).attr('data-tab');

      controller.changeDownloadTab(TAB_ID);
    });

    /* Scroll to anchor */
    $('.anchorNav a').click(function (e) {
      e.preventDefault();
      const aid = $(this).attr('href');
      $('html,body').animate({scrollTop: $(aid).offset().top}, 'slow');
    });

    /* Sticky anchor anchorNav */
    $(window).scroll(function () {
      const top = $(window).scrollTop();

      if ($('.mm-page').offset().top < top) {
        $('.stickyNav').addClass('sticky');
      } else {
        $('.stickyNav').removeClass('sticky');
      }
    });

    controller.onPageLoad();
  });
}(global, $));
