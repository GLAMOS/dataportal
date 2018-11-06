import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import c3 from 'c3';

import ieDetector from '@kspr/gugus-ie-detector';
ieDetector();

import './map/map.js';

(function (global, $) {
  function getDate (dateString)
  {
    return dateString.replace(/\//g, '-');
  }

  function formatNumber (value)
  {
    return String(value).replace('-', '&minus;');
  }

  $(document).ready(function () {
    //initialise Mobile Menu //
    $('#mainMobileNav').mmenu();

    //initialise mapviewer menu
    /*  $("#navMapViewer").mmenu({
      navbar: false,
      extensions: ["position-right"]
    });*/

    //initializes the single preview image lightbox
    $('.imgGallery').lightGallery({
      selector: '.zoomItem',
      download: false
    });

    //initialize download Tabs
    $('ul.tabLinks a').on('click', function () {
      const CLASS_NAME = 'current';
      const TAB_ID = $(this).attr('data-tab');
      const HREF_VALUE = $(this).attr('href');

      $('ul.tabLinks a').removeClass(CLASS_NAME);
      $('.tabPanel').removeClass(CLASS_NAME);

      $(this).addClass(CLASS_NAME);
      $('#' + TAB_ID).addClass(CLASS_NAME);

      //add hash to url
      if (history.pushState) {
        history.pushState(null, null, HREF_VALUE);
      }
      else {
        location.hash = HREF_VALUE;
      }
    });

    const URI = '/geo/griessgletscher_length_change.geojson';
    let loaded = false;
    const onload = function () {
      loaded = true;
      const json = JSON.parse(xhr.responseText);
      const DATA = json.features.map((feature) => feature.properties);
      const X_AXIS_NAME = 'Datum';
      const LINE_LABEL = DATA[0].glacier_short_name;
      const YEARS = [X_AXIS_NAME, getDate(DATA[0].date_from_length)]
        .concat(DATA.map((entry) => getDate(entry.date_to_length)));
      const CUM_LENGTHS = [LINE_LABEL, 0]
        .concat(DATA.map((entry) => entry.length_cum));

      // console.log(DATA);
      // console.log(YEARS);
      // console.log(CUM_LENGTHS);

      const CHART = c3.generate({
        bindto: '#chart',
        data: {
          columns: [YEARS, CUM_LENGTHS],
          xs: {
            [LINE_LABEL]: X_AXIS_NAME
          },
          axes: {
            [LINE_LABEL]: 'y'
          }
        },
        axis: {
          x: {
            // label: 'Jahr',
            // position: 'outer-center',
            tick: {
              format: '%Y', //-%m-%d'
              outer: false
            },
            type: 'timeseries',
          },
          y: {
            label: {
              position: 'outer-middle',
              text: 'Kumulative Längenänderung (m)',
            },
            tick: {
              outer: false
            }
          }
        },
        tooltip: {
          format: {
            value (value) { return `${formatNumber(value)}\xA0m`; }
          }
        }
      });
    };

    /* TODO: Write a fetch API wrapper */
    // fetch(URI)
    // .then((response) => response.json())
    // .then((json) => {
    if (typeof XMLHttpRequest == 'undefined')
    {
      global.XMLHttpRequest = function () {
        let xhr = null;

        /* Legacy IE */
        try
        {
          xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        catch (e) {}

        return xhr;
      };
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', URI, true);
    xhr.onload = onload;
    xhr.onreadystatechange = function () {
      if (loaded) return;
      if (xhr.readyState == 4 && xhr.status === 200)
      {
        loaded = true;
        onload();
      }
    };
    xhr.send(null);
  });
}(this, $));
