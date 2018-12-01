'use strict';

import urlManager from './UrlManager'
import { highlightedGlacier } from './datastore'
import { selectedGlaciers } from './datastore'


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

  //onPageLoad(page) {
  onPageLoad() {
    urlManager.decodeFullHash()
    const highlight = highlightedGlacier.get()
    highlight && bridge.selectGlacier(highlight)
  }

  gotFeatures(features) {
    datastore.features.set(features)
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
    bridge.monitoringSelectedFeatureList.add( feature)
    urlManager.majorUpdate()
  }

  // -- Monitoring

  selectionListHighlight(id) {
    const feature = selectedGlaciers.findById(id)
    bridge.selectGlacier(feature)
    urlManager.minorUpdate()
  }

  selectionListRemove(id) {
    selectedGlaciers.remove( feat => feature2id(feat) != id )
  }

  selectionListReset(id) {
    bridge.monitoringSelectedFeatureList.clear()
  }

  switchChartType(type) {
    //TODO ...update URL
  }

  toggleMapLayer(layerId) {
    //TODO ...update URL
  }

  // -- Downloads

  changeDownloadTab(tabId) {
    //TODO
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

