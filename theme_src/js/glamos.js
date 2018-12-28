import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import c3 from 'c3';

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
