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

  let select_type;
  const BASE_URI = '/glacier-data.php';

  const Graph = function(container) {
    let chart;
    let clear = false;

    const initialize = function(properties, data) {
      const config = {
        data,
        bindto: container,
        axis: {
          x: {
            tick: {
              outer: false,
              rotate: 45
            },
          },
          y: {
            label: {
              position: 'outer',
              text: properties.text
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
            value: properties.formatter
          }
        }
      };

      chart = c3.generate(config);
    };

    const update = function(data, properties, done) {
      properties.apply(chart);
      if (clear) {
        data.unload = true;
        clear = false;
      }
      data.done = done;
      chart.load(data);
    }

    return {
      show(data, properties, done) {
        if (!chart) {
          initialize(properties, data);
          done();
        } else {
          update(data, properties, done);
        }
      },
      clear() {
        clear = true;
      },
      unload() {
        chart.unload();
      }
    };

  }
  const graph = Graph('#chart');

  const Config = function(text, uri_name, type, unit) {
    const formatter = (value) => `${formatNumber(value)}\xA0${unit}`;
    return {
      type,
      unit,
      text,
      baseURI: `${BASE_URI}?type=${uri_name}&id=`,
      formatter,
      apply(chart) {
        chart.axis.labels({y: text});

        /* FIXME: Use method (if any) to set tooltip formatter */
        chart.internal.config.tooltip_format_value = formatter;
      }
    };
  }

  const graphs = {
    length_change: Config('Kumulative Längenänderung (m)', 'length_change', 'line', 'm'),
    mass_balance: Config('Massenbilanz (mm H₂0)', 'mass_balance', 'bar', 'mm H₂0'),
  }


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
      if (options.clear) {
        graph.clear()
      }

      const KEY_YEAR = 'year';
      const KEY_NAME = 'glacier_full_name';
      const DATA_TYPE = select_type.options[select_type.selectedIndex].value;
      const DATA_CONFIG = graphs[DATA_TYPE];

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

        const XHR = new XMLHttpRequest();

        XHR.open('GET', DATA_CONFIG.baseURI + GLACIER_ID, true);

        XHR.onload = function (ev) {
          const nextRequest = function() {
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
              type: DATA_CONFIG.type
            };
            graph.show(CHART_DATA, DATA_CONFIG, nextRequest);
          }
          else
          {
            /* Request successful, but no data of this type available */

            /* TODO: Display message only if there are no data at all, without breaking the chart */
            // document.getElementById('chart').innerHTML = 'Keine Daten verfügbar.';

            /*
             * Clear chart if there is only one glacier in the list
             * but for which there is no data of this type.
             *
             * FIXME: What if there are several glaciers, all without data for this type?
             */
            if (num_requests === 1) graph.unload();

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

    select_type = document.getElementById('chart_param');
    select_type.onchange = function () {
      controller.switchChartType(this.options[this.selectedIndex].value);
    };
  });
}(global, $));
