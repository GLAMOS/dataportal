import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import c3 from 'c3';

import ieDetector from '@kspr/gugus-ie-detector';
ieDetector();

import controller from './controller';

import './map/map.js';
import sidepane from './map/monitoringSidepane';


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

  let chart;
  let SELECT_TYPE;
  const BASE_URI = '/glacier-data.php';

  controller.bridge({
    /**
     * Load data for glaciers
     *
     * @param  {Array[string]} ids  Glacier IDs
     * @param  {Object} options
     *   | Property | Meaning |
     *   |:-------- |:--------|
     *   | clear    | If <code>true</code>, previous data will be unloaded. Default: <code>false</code>. |
     */
    loadGlacierData (glacierIds, options = {clear: false}) {
      const DATA_CONFIG = {
        length_change: {
          axis: {
            y: {
              label: {
                text: 'Kumulative Längenänderung (m)',
              }
            }
          },
          type: 'line',
          BASE_URI: `${BASE_URI}?type=length_change&id=`,
        },
        mass_balance: {
          axis: {
            y: {
              label: {
                text: 'Massenbilanz (mm H20)',
              }
            }
          },
          type: 'bar',
          BASE_URI: `${BASE_URI}?type=mass_balance&id=`,
        }
      };

      /* DEBUG */
      // console.log(`IDs: ${ids}`);

      const KEY_YEAR = 'year';
      const KEY_NAME = 'glacier_full_name';
      const DATA_TYPE = SELECT_TYPE.options[SELECT_TYPE.selectedIndex].value;
      const LABEL_VALUES = DATA_CONFIG[DATA_TYPE].axis.y.label.text;
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
              text: LABEL_VALUES
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

      if (chart)
      {
        chart.axis.labels({y: LABEL_VALUES});
      }

      const num_requests = glacierIds.length;

      /**
       * Makes an HTTP request for the data of a glacier
       *
       * @param  {int} glacierIndex
       *   Index in the list of glaciers IDs of the glacier whose data is to be fetched
       */
      function makeRequest (glacierIndex)
      {
        const GLACIER_ID = glacierIds[glacierIndex];

        /* TODO: Write a fetch API wrapper */
        // fetch(DATA_CONFIG[DATA_TYPE].BASE_URI + GLACIER_ID)
        // .then((response) => response.json())
        // .then((json) => {
        // }

        const XHR = new XMLHttpRequest();

        XHR.open('GET', DATA_CONFIG[DATA_TYPE].BASE_URI + GLACIER_ID, true);

        XHR.onload = function (ev) {
          function nextRequest ()
          {
            /* Make XHR for next glacier, if any */
            if (glacierIndex + 1 < num_requests)
            {
              makeRequest(glacierIndex + 1);
            }
          }

          const JSON_DATA = JSON.parse(ev.target.responseText);

          if (JSON_DATA && JSON_DATA.length > 0)
          {
            const YEARS = [KEY_YEAR].concat(JSON_DATA.map((entry) => entry.year));
            const VALUES = [GLACIER_ID].concat(JSON_DATA.map((entry) => entry.value));
            const LABEL_LINE = JSON_DATA[0][KEY_NAME];
            const CHART_DATA = {
              x: KEY_YEAR,
              columns: [YEARS, VALUES],
              names: {
                [GLACIER_ID]: LABEL_LINE
              },
              type: DATA_CONFIG[DATA_TYPE].type
            };

            /* DEBUG */
            console.log(JSON_DATA);
            console.log(CHART_DATA);

            if (!chart)
            {
              CHART_CONFIG.data = CHART_DATA;
              chart = c3.generate(CHART_CONFIG);

              /* DEBUG */
              global.my.chart = chart;

              /* NOTE: c3.generate() ignores .data.done property, so we have to do it manually */
              nextRequest();
            }
            else
            {
              CHART_DATA.done = nextRequest;

              if (options.clear)
              {
                CHART_DATA.unload = true;
              }
              else
              {
                delete CHART_DATA.unload;
              }

              chart.load(CHART_DATA);

              /* Only unload for the first glacier per glacier set if options.clear === true */
              options.clear = false;
            }
          }
          else
          {
            /* Request successful, but no data of this type available */

            /* TODO: Display message only if there are no data at all, without breaking the chart */
            // document.getElementById('chart').innerHTML = 'Keine Daten verfügbar.';

            nextRequest();
          }
        };

        XHR.onerror = function () {
          /* Do something if network connection fails */
        };

        XHR.send(null);
      }

      makeRequest(0);
    },
    /**
     * Unload the data of a specific glacier
     * @param  {string} id  Glacier ID
     */
    unloadGlacierData (id) {
      chart.unload({ids: [id]});
    }
  });

  $(document).ready(() => {
    /* initializing */
    controller.onPageLoad();
    sidepane.setup();

    SELECT_TYPE = document.getElementById('chart_param');
    SELECT_TYPE.onchange = function () {
      controller.switchChartType(this.options[this.selectedIndex].value);
    };
  });
}(global, $));
