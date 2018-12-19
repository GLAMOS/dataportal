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
  const SELECT_TYPE = document.getElementById('chart_param');

  controller.bridge({
    /**
     * Load data for glaciers
     * @param  {Array[string]} ids  Glacier IDs
     * @param  {Object} options
     *   | Property | Meaning |
     *   |:-------- |:--------|
     *   | unload   | If <code>true</code>, previous data will be unloaded. Default: <code>false</code>. |
     */
    loadGlacierData (ids, options = {unload: false}) {
      const DATA_CONFIG = {
        length_change: {
          URI: '/glacier-data.php?type=length_change&id='  // '/geo/griessgletscher_length_change.geojson',
          axis: {
            y: {
              label: {
                text: 'Kumulative Längenänderung (m)',
              }
            }
          },
          type: 'line',
        },
        mass_balance: {
          URI: '/glacier-data.php?type=mass_balance&id='   // '/geo/griessgletscher_mass_change.geojson'
          axis: {
            y: {
              label: {
                text: 'Massenbilanz (mm H20)',
              }
            }
          },
          type: 'bar',
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

      for (let i = 0, len = ids.length; i < len; ++i)
      {
        const xhr = new XMLHttpRequest();
        const id = ids[i];

        xhr.open('GET', DATA_CONFIG[DATA_TYPE].URI + id, true);

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
            }
            else
            {
              chart.axis.labels({y: LABEL_VALUES});

              if (options.unload)
              {
                CHART_DATA.unload = true;
              }
              else
              {
                delete CHART_DATA.unload;
              }

              chart.load(CHART_DATA);

              /* Only unload for the first (fastest) glacier per glacier set */
              options.unload = false;
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
        /*
         * FIXME: Avoid race conditions by fulfilling a promise when all glaciers have been processed
         *        (regardless of success/failure) _instead_
         */
        window.setTimeout(function () {
          this.send(null);
        }.bind(xhr), i * 1500);
      }
    },
    /**
     * Unload the data of a specific glacier
     * @param  {string} id  Glacier ID
     */
    unloadGlacierData (id) {
      chart.unload({ids: [id]});
    }
  });

  /* initializing */
  controller.onPageLoad();
  sidepane.setup();

  SELECT_TYPE.onchange = function () {
    controller.switchChartType(this.options[this.selectedIndex].value);
  };
}(global, $));
