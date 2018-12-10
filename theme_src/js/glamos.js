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

  function fetchData (id)
  {
    const URIS = {
      length_change: `/glacier-data.php?id=${id}`, // '/geo/griessgletscher_length_change.geojson',
      mass_change: '/geo/griessgletscher_mass_change.geojson'
    };

    let loaded = false;
    const onload = function () {
      if (loaded) return;
      loaded = true;

      const JSON_DATA = JSON.parse(xhr.responseText);
      const KEY_NAME = 'glacier_full_name';
      const KEY_YEAR = 'year_to';

      if (!JSON_DATA || JSON_DATA.length === 0)
      {
        document.getElementById('chart').innerHTML = 'Keine Daten verfügbar.';
        return;
      }

      const LINE_LABEL = JSON_DATA[0][KEY_NAME];
      const YEARS = [KEY_YEAR].concat(JSON_DATA.map((entry) => entry.year_to));
      const VALUES = [LINE_LABEL].concat(JSON_DATA.map((entry) => entry.variation_cumulative));
      const CHART_DATA = [YEARS, VALUES];

      /* DEBUG */
      console.log(JSON_DATA);
      console.log(CHART_DATA);

      if (!chart)
      {
        chart = c3.generate({
          bindto: '#chart',
          data: {
            x: KEY_YEAR,
            columns: CHART_DATA,
          },
          axis: {
            x: {
              tick: {
                format: '%Y', //-%m-%d'
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
        });
      }
      else
      {
        chart.load({
          columns: CHART_DATA
        });
      }
    };

    /* TODO: Write a fetch API wrapper */
    // fetch(URI)
    // .then((response) => response.json())
    // .then((json) => {
    // }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', URIS.length_change, true);
    xhr.onload = onload;
    xhr.onreadystatechange = function () {
      if (loaded) return;

      if (xhr.readyState == 4 && xhr.status === 200)
      {
        onload();
      }
    };
    xhr.send(null);
  }
  controller.bridge({fetchData});

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

    // const ID = window.location.hash.replace(/^#/, '');
    // fetchData(ID);

    controller.onPageLoad();
  });
}(global, $));
