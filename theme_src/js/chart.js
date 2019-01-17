import c3 from 'c3';
const BASE_URI = '/glacier-data.php';

/** Construct a graph instance
  *
  * Graph instances display a C3 chart in the given container.
  * You can tell them to show() data, unload() data or
  * clear() the chart.
  */
export const Graph = function(container) {
  let chart;
  const synch = Synch();

  const generate = function(properties, data) {
    const config = properties.config(container, data);

    chart = c3.generate(config);
  };

  const update = function(data, properties) {
    properties.apply_to(chart);
    data.done = synch.next;
    chart.load(data);
  }

  const enqueueIfNeeded = function(op) {
    // As long as there's no chart, clear and unload are NOOP
    // Make sure not to skip synch.next call in any enqueued callback!
    chart && synch.enqueue(op);
  };

  // Build instance and return it
  return {
    show(properties, data) {
      if (!chart) {
        generate(properties, data);
      } else {
        synch.enqueue(() => update(data, properties));
      }
    },
    clear() { enqueueIfNeeded(() => chart.unload({ done: synch.next })); },
    hide(id) { enqueueIfNeeded(() => chart.unload({ ids: [id], done: synch.next })); },
  };
}


/** Create object that synchronizes operations
 *
 * You can tell it to enqueue() ops. Each op needs to call
 * next() once it's done to start the next op.
 *
 * When no op is in progress, op() will be called
 * immediately on enqueue().
 */
const Synch = function() {
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

  return {
    next,
    enqueue(op) {
      pending.push(op);

      if (processing) {
        // We're lready processing, op will call next()
        // for us when it's done.
      } else {
        // If we're idle, start the next op
        next();
      }
    }
  }
}


/** Construct a config instance
 *
 * Configs can build request uri(), create a C3 config(), and
 * apply_to() axis labels on C3 charts.
 */
const Config = function(text, uri_name, chart_type, unit) {
  const formatter = (value) => `${String(value).replace('-', '&minus;')}&nbsp;${unit}`;
  const config = (container, data) => ({
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
          text: text
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
        value: formatter
      }
    }
  });
  return {
    config,
    type: chart_type,
    uri(glacier_id) { return `${BASE_URI}?type=${uri_name}&id=${glacier_id}`; },
    apply_to(chart) {
      chart.axis.labels({y: text});

      /* FIXME: Use method (if any) to set tooltip formatter */
      chart.internal.config.tooltip_format_value = formatter;
    }
  };
}


/** Available chart configs */
export const configs = {
  length_change: Config('Kumulative Längenänderung (m)', 'length_change', 'line', 'm'),
  mass_balance: Config('Massenbilanz (mm H₂0)', 'mass_balance', 'bar', 'mm H₂0'),
}


/** Create a Loading instance
 *
 * It pulls and restructures data then calls the done function.
 * You can ask whether it's finished() and get the data()
 * from it.
 * If there was no data to be loaded, data() returns false.
 */
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

/** Create a loading queue instance
 *
 * You can tell it to load() data by glacier ID.
 * It will call loaded() in the same order as load() was called
 * when data becomes available.
 * When no data is available for a given ID, loaded() will
 * not be called.
 * If you don't want any more updates, tell it to cancel().
 */
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


/** Desired state of a chart
 *
 * It can give you a cleared() version of itself with an empty ids list. You can
 * ask it which ids are added() or removed() in another selection.
*/
export const Selection = function(type, ids) {
  const config = configs[type];

  const cleared = function() {
    return Selection(type, []);
  };

  const only_in_first = function(first, second) {
    return first.filter(id => second.indexOf(id) < 0);
  }

  const added = function(other) {
    return only_in_first(other.ids, ids);
  }

  const removed = function(other) {
    return only_in_first(ids, other.ids);
  }

  return {type, ids, config, cleared, added, removed};
}


/** Shows a chart in the given container
 *
 * You can tell it to update() itself to a new selection.
*/
export const Chart = function(container) {
  let graph = Graph(container);
  let queue;
  let selection = Selection('uninitialized', []);

  const update = function(newSelection) {
    if (queue) queue.cancel();
    const config = newSelection.config;
    queue = Queue(config, (data) => graph.show(config, data));

    if (selection.type !== newSelection.type) {
      graph.clear();
      selection = newSelection.cleared();
    }

    for (let id of selection.removed(newSelection)) graph.hide(id);
    for (let id of selection.added(newSelection)) queue.load(id);

    selection = newSelection;
  }

  return {update};
}
