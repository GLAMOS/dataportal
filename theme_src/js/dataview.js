import { Chart, Selection } from './chart';
import controller from './controller';
import datastore from './datastore';

/** A dataview displays a chart for multiple glaciers
 * 
 * Tell it to setup() event handlers and graph library once.
 * It will then tell controller when to switchChartType().
 * 
 * You can tell it to update() and it will add or remove
 * data displayed in the chart depending on selectedGlaciers.
 */
class Dataview {
  setup() {
    this.chart = Chart('#chart');
    this.select_type = $('#chart_param');
    this.select_type.change(function() {
      controller.switchChartType();
    });
  }

  update() {
    // HACK do nothing if we're called for the wrong page
    if (!this.select_type.length) return;

    const ids = datastore.selectedGlaciers.get();
    const type = this.select_type.val();
    this.chart.update(Selection(type, ids));    
  }
};

export default new Dataview();
