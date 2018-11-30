'use strict';


// -----
// constants


// -----
// variables

let bridge = {}   // store references to functions that should be moved herein


// -----
// helpers


// ----- Our Controller (Action -> Reaction)

class Controller {

  // -- Home

  mapMarkerHighlighted(feature) {
  }

  searchSelected(feature) {
  }

  // -- Monitoring

  selectionListHighlight(id) {
  }

  selectionListRemove(id) {
  }

  selectionListReset(id) {
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

