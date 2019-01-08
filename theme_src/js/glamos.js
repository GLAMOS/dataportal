import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';

import ieDetector from '@kspr/gugus-ie-detector';
ieDetector();

import controller from './controller';

import './map/map.js';
import sidepane from './map/monitoringSidepane';
import { Graph, configs, Queue } from './chart';


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
  
  const graph = Graph('#chart');
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

    select_type = $('#chart_param');
    select_type.change(function() {
      controller.switchChartType(select_type.val());
    });
  });
}(global, $));
