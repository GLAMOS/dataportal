'use strict';

import urlManager from './UrlManager';
import datastore from './datastore';

import factsheetDetails from './factsheetDetails'
import dataview from './dataview';


/* Constants */

/* Variables */

/* store references to functions that should be moved herein */
const bridge = {};

/* Helpers */

function feature2id (feature) {
  return feature.getId();
}

function factsheetUpdate(feature) {
  if( 'factsheet' == datastore.currentPage) factsheetDetails.setup(feature)
}


/** Our Controller (Action → Reaction) */

class Controller {
  _bootstrapFromState () {
    if (datastore.downloadTab) {
      bridge.selectDownloadTab(datastore.downloadTab);
    }
    const feature = datastore.highlightedGlacier.feature;
    if (feature) {
      bridge.selectGlacier(feature);
      bridge.mapPanTo(feature);
      dataview.load(datastore.selectedGlaciers.get());
      factsheetUpdate(feature)
    }
    bridge.monitoringSelectedFeatureList.refresh();
  }

  _chooseRandom () {
    const feature = datastore.features.getRandomVIG();
    if (feature) {
      bridge.selectGlacier(feature);
      dataview.load([feature2id(feature)], {clear: true});
      bridge.mapPanTo(feature);
      bridge.monitoringSelectedFeatureList.add(feature);
    }
  }

  /**
   * sets some state bits to defaults if they're empty
   */
  _setFallbackState () {
    let needsUpdate = false;

    // default to random glacier
    if (!datastore.highlightedGlacier.get()) {
      this._chooseRandom();
      needsUpdate = true;
    }

    // default to first Download-Tab
    if (!datastore.downloadTab && 'downloads' == datastore.currentPage) {
      const allTabs = bridge.getAvailableDownloadTabs();
      this.changeDownloadTab(allTabs[0]);
      needsUpdate = true;
    }

    if (needsUpdate) {
      // TODO: move to helper since linked
      urlManager.minorUpdate();
      bridge.dynamicLinks();
    }
  }

  /* Init */

  //onPageLoad(page) {
  onPageLoad () {
    dataview.setup();

    urlManager.loadState();
    this._setFallbackState();
    this._bootstrapFromState();
    bridge.dynamicLinks();
    urlManager.observeHistory();
  }

  onNavigate () {
    this.onPageLoad();   /* just alias */
  }

  gotFeatures (features) {
    datastore.features.set(features);
    urlManager.loadState();
    this._setFallbackState();
    this._bootstrapFromState();
    bridge.enableSearch(features);
  }

  /* Home */

  mapMarkerHighlighted (feature) {
    bridge.selectGlacier(feature);
    dataview.load([feature2id(feature)]);
    /* note: no map panning */
    bridge.monitoringSelectedFeatureList.add(feature);
    urlManager.majorUpdate();
  }

  searchSelected (feature) {
    bridge.selectGlacier(feature);
    dataview.load([feature2id(feature)]);
    bridge.mapPanTo(feature);
    bridge.monitoringSelectedFeatureList.add(feature);
    factsheetUpdate(feature)
    urlManager.majorUpdate();
  }

  /* Monitoring */

  selectionListHighlight (id) {
    const feature = datastore.selectedGlaciers.findById(id);
    bridge.selectGlacier(feature);
    bridge.mapPanTo(feature);
    urlManager.minorUpdate();
  }

  selectionListRemove (id) {
    datastore.selectedGlaciers.remove(id);
    dataview.unload(id);

    /* Select last entry in selected glaciers list */
    // this.selectionListHighlight( datastore.selectedGlaciers.get().slice(-1)[0] )
    urlManager.majorUpdate();
  }

  selectionListReset () {
    datastore.selectedGlaciers.clear();
    this._chooseRandom();
    urlManager.majorUpdate();
  }

  switchChartType (type) {
    dataview.load(datastore.selectedGlaciers.get(), {clear: true});

    /* TODO: Update URL */
  }

  toggleMapLayer (layerId) {
    //TODO ...update URL
  }

  // -- Downloads

  changeDownloadTab (tabId) {
    datastore.downloadTab = tabId;
    bridge.selectDownloadTab(tabId);
    urlManager.minorUpdate();
  }

  // TODO: More to come...
}


/* end Controller */

/* Singleton instance */
let controller = new Controller();

if (!(Object.assign instanceof Function))
{
  Object.assign = (
    (target, ...sources) => sources.forEach(
      (source) => Object.keys(source).forEach(
        (key) => { target[key] = source[key]; }
      )
    )
  );
}

/* Inject foreign implemented function into controller (they should be moved here though) */
controller.bridge = function (options) {
  Object.assign(bridge, options);
};


/* DEBUG */
controller = new Proxy(
  controller,
  { get (controller, fn, proxy) {
    return function wrapped () {
      console.debug('Controller', fn, arguments);
      return controller[fn].apply(this, arguments);
    };
  }}
);

/* Exports */

export default controller;

// module.exports = {
// }
