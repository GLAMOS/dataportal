import c3 from 'c3';
const BASE_URI = '/glacier-data.php';

export const Graph = function(container) {
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
    clear() { enqueue(() => chart && chart.unload({ done: next })); },
    unload(id) { enqueue(() => chart && chart.unload({ ids: [id], done: next })); },
  };

}

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


export const configs = {
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
      const years = [KEY_YEAR].concat(json.map((e) => e.year));
      const values = [glacier_id].concat(json.map((e) => e.value));
      const label_line = json[0]['glacier_full_name'];
      data = {
        x: KEY_YEAR,
        columns: [years, values],
        names: {
          [glacier_id]: label_line
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

export const Queue = function(config, loaded) {
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