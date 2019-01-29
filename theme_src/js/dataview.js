import { Chart } from './chart';
import controller from './controller';
import datastore from './datastore';

/** A dataview displays charts for multiple glaciers
 *
 * Tell it to setup() event handlers and graph library once.
 * It will monitor the selection of the #chart_param control
 * and tell controller when to switchChartType().
 *
 * You can tell it to update() and it will add or remove
 * data displayed in the chart.
 */
class Dataview {
  setup() {
    // Only one of these is shown at a time, depending on select_source
    this.containers = $(".chartContainer .js-chart");

    // Keep chart instances indexed by source name
    this.charts = {};

    this.containers.each((_, container) => {
      const options = $(container).data();
      options.showNames = true;

      const chart = Chart(container, options);
      this.charts[options.source] = chart;
    });

    this.select_source = $('#chart_param');
    this.select_source.change(function () {
      controller.switchChartType();
    });
  }

  update() {
    // HACK do nothing if we're called for the wrong page
    if (!this.select_source.length) return;

    const source = this.select_source.val();

    this.containers.hide();
    this.containers.filter(`[data-source="${source}"]`).show();

    const ids = datastore.selectedGlaciers.get();
    this.charts[source].update(ids);
  }
};

export default new Dataview();
