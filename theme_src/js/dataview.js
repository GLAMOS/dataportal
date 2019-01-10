import { Graph, configs, Queue } from './chart';
import controller from './controller';

/** A dataview displays a chart for multiple glaciers */
class Dataview {
  setup() {
    this.graph = Graph('#chart');
    this.select_type = $('#chart_param');
    this.select_type.change(function() {
      controller.switchChartType();
    });
    this.queue = false;
  }

  /**
   * Load data for glaciers
   *
   * @param  {Array[string]} ids  Glacier IDs
   * @param  {Object} options
   *   | Property | Meaning |
   *   |:-------- |:--------|
   *   | clear    | If <code>true</code>, previous data will be unloaded. Default: <code>false</code>. |
   */
  load(glacierIds, options = {clear: false}) {
    // HACK do nothing if we're called for the wrong page
    if (!this.select_type.length) return;

    // Flag clear is set when the chart type changes.
    // In this case we drop all pending queries and
    // start a new queue with the new config
    if (options.clear) {
      if (this.queue) {
        this.queue.cancel();
        this.queue = false; // Will be created with new config
      }
      this.graph.clear();
    }

    const type = this.select_type.val();
    const config = configs[type];

    if (!this.queue) {
      this.queue = Queue(config, (data) => this.graph.show(config, data));
    }

    for (let id of glacierIds) this.queue.load(id);
  }

  /**
   * Unload the data of a specific glacier
   * @param  {string} id  Glacier ID
   */
  unload(id) {
    this.graph.unload(id);
  }
};

export default new Dataview();
