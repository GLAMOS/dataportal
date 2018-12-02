'use strict';

import urlManager from './UrlManager'
import datastore from './datastore'


// -----
// constants


// -----
// variables

let bridge = {}   // store references to functions that should be moved herein


// -----
// helpers

function feature2id(feature) {
  return feature.getId()
}


// ----- Our Controller (Action -> Reaction)

class Controller {

  _bootstrapFromState() {
    if(datastore.downloadTab) {
      bridge.selectDownloadTab( datastore.downloadTab)
    }
    const feature = datastore.highlightedGlacier.feature
    if(feature) {
      bridge.selectGlacier(feature)
      bridge.mapPanTo(feature)
    }
    bridge.monitoringSelectedFeatureList.refresh()
  }

  _chooseRandom() {
    const feature = datastore.features.findById( bridge.getRandomVIP() )
    bridge.selectGlacier(feature)
    bridge.mapPanTo(feature)
    bridge.monitoringSelectedFeatureList.add(feature)
  }

  // -- Init

  //onPageLoad(page) {
  onPageLoad() {
    urlManager.decodeFullHash()
    this._bootstrapFromState()
    bridge.dynamicLinks()
  }

  gotFeatures(features) {
    datastore.features.set(features)
    urlManager.decodeFullHash()
    this._bootstrapFromState()
    bridge.enableSearch(features);
  }

  // -- Home

  mapMarkerHighlighted(feature) {
    bridge.selectGlacier(feature)
    // note: no map panning
    bridge.monitoringSelectedFeatureList.add( feature)
    urlManager.majorUpdate()
  }

  searchSelected(feature) {
    bridge.selectGlacier(feature)
    bridge.mapPanTo(feature)
    bridge.monitoringSelectedFeatureList.add( feature)
    urlManager.majorUpdate()
  }

  // -- Monitoring

  selectionListHighlight(id) {
    const feature = datastore.selectedGlaciers.findById(id)
    bridge.selectGlacier(feature)
    bridge.mapPanTo(feature)
    urlManager.minorUpdate()
  }

  selectionListRemove(id) {
    datastore.selectedGlaciers.remove(id)
    // select last entry in selected glaciers list
    // this.selectionListHighlight( datastore.selectedGlaciers.get().slice(-1)[0] )
    urlManager.majorUpdate()
  }

  selectionListReset(id) {
    datastore.selectedGlaciers.clear()
    this._chooseRandom()
    urlManager.majorUpdate()
  }

  switchChartType(type) {
    //TODO ...update URL
  }

  toggleMapLayer(layerId) {
    //TODO ...update URL
  }

  // -- Downloads

  changeDownloadTab(tabId) {
    datastore.downloadTab = tabId
    bridge.selectDownloadTab(tabId)
    urlManager.minorUpdate()
  }

  // TODO: More to come...

}


// -----

// -- singleton instance
let controller = new Controller()

// -- inject foreign implemented function into controller (they should be moved here though)
controller.bridge = function(options) {
  Object.assign( bridge, options)
}


// -- debugging usage
controller = new Proxy(
  controller,
  { get: function( controller, fn, proxy) {
      return function wrapped() {
        console.debug('Controller', fn, arguments)
        return controller[fn].apply(this, arguments)
      }
  }}
)

// -----
// exports

export default controller

//module.exports = {
//}

