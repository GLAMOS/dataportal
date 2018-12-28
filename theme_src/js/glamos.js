import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import c3 from 'c3';

import ieDetector from '@kspr/gugus-ie-detector';
ieDetector();

import controller from './controller';

import './map/map.js';
import sidepane from './map/monitoringSidepane';


(function (global, $) {
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
    const pending = []; // Pending operations
    let processing = false;

    const next = function() {
      const op = pending.shift();
      if (op) {
        processing = true;
        op();
      } else {
        processing = false;
      }
    }

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

    const update = function(data, properties) {
      properties.apply(chart);
      data.done = next;
      chart.load(data);
    }

    const enqueue = function(op) {
      pending.push(op);
      if (!processing) next();
    }

    return {
      show(properties, data) {
        if (!chart) {
          initialize(properties, data);
        } else {
          enqueue(() => update(data, properties));
        }
      },
      clear() { enqueue(() => chart.unload({ done: next })); },
      unload(id) { enqueue(() => chart.unload({ ids: [id], done: next })); },
    };

  }

  const graph = Graph('#chart');

  const Config = function(text, uri_name, type, unit) {
    const formatter = (value) => `${String(value).replace('-', '&minus;')}\xA0${unit}`;
    return {
      type,
      unit,
      text,
      formatter,
      uri(glacier_id) { return `${BASE_URI}?type=${uri_name}&id=${glacier_id}`; },
      apply(chart) {
        chart.axis.labels({y: text});

        /* FIXME: Use method (if any) to set tooltip formatter */
        chart.internal.config.tooltip_format_value = formatter;
      }
    };
  }


  const configs = {
    length_change: Config('Kumulative Längenänderung (m)', 'length_change', 'line', 'm'),
    mass_balance: Config('Massenbilanz (mm H₂0)', 'mass_balance', 'bar', 'mm H₂0'),
  }


  const Loading = function(glacier_id, config, done) {
    let finished = false;
    let data = false;

    const receiver = function(event) {
      const json = JSON.parse(event.target.responseText);

      if (json && json.length > 0) {
        const KEY_YEAR = 'year';
        const YEARS = [KEY_YEAR].concat(json.map((e) => e.year));
        const VALUES = [glacier_id].concat(json.map((e) => e.value));
        const LABEL_LINE = json[0]['glacier_full_name'];
        data = {
          x: KEY_YEAR,
          columns: [YEARS, VALUES],
          names: {
            [glacier_id]: LABEL_LINE
          },
          type: config.type
        };
      } else {
        /* Request successful, but no data of this type available */
      }
      finished = true;
      done();
    };

    const req = new XMLHttpRequest();
    req.addEventListener("load", receiver)
    req.open('GET', config.uri(glacier_id), true);
    req.send();

    return {
      finished() { return finished; },
      data() { return data; },
    }
  }
  
  const Queue = function(config, loaded) {
    const queue = [];
    let canceled = false;

    const done = function() {
      if (canceled) return;
      while(queue.length > 0 && queue[0].finished()) {
        const item = queue.shift();
        const data = item.data();
        if (data) {
          loaded(data);
        }
      }
    }
    
    return {
      load(id) { queue.push(Loading(id, config, done)) },
      cancel() { canceled = true; }
    }
  }

  let queue;

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
        if (queue) {
          console.log("canceling loader")
          queue.cancel();
          queue = false;
        }
        graph.clear();
      }

      const DATA_TYPE = select_type.options[select_type.selectedIndex].value;
      const DATA_CONFIG = configs[DATA_TYPE];

      if (!queue) {
        queue = Queue(DATA_CONFIG, (data) => graph.show(DATA_CONFIG, data));
      }

      for (let id of glacierIds) queue.load(id);
    },

    /**
     * Unload the data of a specific glacier
     * @param  {string} id  Glacier ID
     */
    unloadGlacierData (id) {
      graph.unload(id);
    }
  });

  $(document).ready(() => {
    /* initializing */
    controller.onPageLoad();
    sidepane.setup();

    select_type = document.getElementById('chart_param');
    if (select_type) {
      select_type.onchange = function () {
        controller.switchChartType(this.options[this.selectedIndex].value);
      };
    }
  });
}(global, $));
