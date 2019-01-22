import c3 from 'c3';
const BASE_URI = '/glacier-data.php';

/** Construct a graph instance
  *
  * Graph instances display a C3 chart in the given container.
  * You can tell them to show() data, unload() data or
  * clear() the chart.
  */
const Graph = function(container) {
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
const configs = {
  length_change: Config('Kumulative Längenänderung (m)', 'length_change', 'line', 'm'),
  mass_balance: Config('Massenbilanz (mm H₂0)', 'mass_balance', 'bar', 'mm H₂0'),
}


/** Query data for glacier id
 *
 * When you tell it to start(done) it pulls and restructures
 * data then calls done(). You can ask whether it's finished()
 * and get the data() from it.
 *
 * If there was no data to be loaded, data() returns false.
 */
const Query = function(id, config) {
  let finished = false;
  let json = false;

  const data = function() {
    if (json && json.length > 0) {
      const KEY_YEAR = 'year';
      const years = [KEY_YEAR].concat(json.map((e) => e.year));
      const values = [id].concat(json.map((e) => e.value));
      const label_line = json[0]['glacier_full_name'];
      return {
        x: KEY_YEAR,
        columns: [years, values],
        names: {
          [id]: label_line
        },
        type: config.type
      };
    } else {
      /* No data of this type available */
      return false;
    }
  };

  const start = function(done) {
    const receiver = function(event) {
      json = JSON.parse(event.target.responseText);
      finished = true;
      done();
    };

    const req = new XMLHttpRequest();
    req.addEventListener("load", receiver);
    req.open('GET', config.uri(id), true);
    req.send();
  };

  return {
    id,
    data,
    start,
    finished() { return finished; },
  }
}

/** Create a loading queue instance
 *
 * You can add() queries to the queue. The queue will start()
 * each query. It will call loaded() for queries in the same
 * order add() was called when data becomes available.
 *
 * Example:
 *    const loaded = console.log;
 *    const queue = Queue(loaded);
 *    const item1 = Item(...);
 *    const item2 = Item(...);
 *    queue.add(item1) // item1.start() is called
 *    queue.add(item2) // item2.start() is called
 *
 *    // When the queries complete, loaded() is called in order by the queue:
 *    loaded(item1); // Once item1 is loaded
 *    loaded(item2); // Once item2 is loaded
 *
 *
 * If you don't want any more updates, tell it to cancel().
 */
const Queue = function(loaded) {
  const queue = [];
  let canceled = false;

  const done = function() {
    if (canceled) return;
    while(queue.length > 0 && queue[0].finished()) {
      loaded(queue.shift());
    }
  }

  const add = function(item) {
    item.start(done);
    queue.push(item);
  };

  return {
    add,
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

  const unique = function(list) {
    return list.filter((id, i) => list.indexOf(id) == i);
  }

  const added = function(other) {
    return only_in_first(other.ids, ids);
  }

  const removed = function(other) {
    return only_in_first(ids, other.ids);
  }

  const including = function(include) {
    return Selection(type, unique([include, ...ids]));
  };

  const excluding = function(exclude) {
    return Selection(type, ids.filter(id => id != exclude));
  };

  return {type, ids, config, cleared, added, removed, including, excluding};
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
    // When the chart type changes (between line and bar-chart)
    // we need to remove all data from the chart first.
    if (selection.type !== newSelection.type) {
      graph.clear();
      selection = newSelection.cleared();
    }

    // If there are ID that should not be shown in the desired state
    // we tell the graph to remove them.
    for (let id of selection.removed(newSelection)) {
      graph.hide(id);
      selection = selection.excluding(id);
    }

    // In the last step we launch data queries for all ID that are
    // to be shown. First we have to build the handler that shows
    // incoming data in the chart.
    const config = newSelection.config;
    const loaded = (item) => {
      // Update graph with incoming data
      const data = item.data();
      if (data) graph.show(config, data);

      // Mark this id as loaded, even if there was no data
      selection = selection.including(item.id);
    };

    // When we receive a new desired state, we cancel all
    // requests and launch them anew. This is inefficient
    // when there are pending queries but it's much easier
    // to manage.
    if (queue) queue.cancel();
    queue = Queue(loaded);

    // Now enqueue a query for all the ID that are desired but
    // not shown yet. They will be loaded async and shown when
    // the query completes. The queue will call loaded() on
    // each.
    for (let id of selection.added(newSelection)) {
      queue.add(Query(id, config));
    }
  }

  return {update};
}
