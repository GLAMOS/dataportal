import { Graph, configs, Queue } from './chart';

/** A dataview displays a chart for multiple glaciers */
export const Dataview = function() {
  let select_type;
  let graph;
  let queue;

  const setup = function(controller) {
    graph = Graph('#chart');
    select_type = $('#chart_param');
    select_type.change(function() {
      controller.switchChartType();
    });
  };

  /**
   * Load data for glaciers
   *
   * @param  {Array[string]} ids  Glacier IDs
   * @param  {Object} options
   *   | Property | Meaning |
   *   |:-------- |:--------|
   *   | clear    | If <code>true</code>, previous data will be unloaded. Default: <code>false</code>. |
   */
  const load = function(glacierIds, options = {clear: false}) {
    // HACK do nothing if we're called for the wrong page
    if (!select_type.length) return;

    // Flag clear is set when the chart type changes.
    // In this case we drop all pending queries and
    // start a new queue with the new config
    if (options.clear) {
      if (queue) {
        queue.cancel();
        queue = false; // Will be created with new config
      }
      graph.clear();
    }

    const type = select_type.val();
    const config = configs[type];

    if (!queue) {
      queue = Queue(config, (data) => graph.show(config, data));
    }

    for (let id of glacierIds) queue.load(id);
  };

  /**
   * Unload the data of a specific glacier
   * @param  {string} id  Glacier ID
   */
  const unload = function(id) {
    graph.unload(id);
  };

  return {setup, load, unload};
};