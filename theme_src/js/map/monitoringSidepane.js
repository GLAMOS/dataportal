
import controller from '../controller'
import datastore from '../datastore'   // the one feature (glacier) which is selected


// -----
// constants

// are directly the CSS classes of the corresponding box nodes
const SIDE_GLACIERS = 'sidebarControls'
const SIDE_LAYERS = 'layerswitcher'
const SIDE_MEASURE = 'latestMeasurements'   // separated only for mobile


// -----
// variables


// -----
// helpers


// -----

function goToDefaultTab() {
  // TODO: if mobile, leave sidepane closed (=null(?))
  datastore.sidepane = SIDE_GLACIERS
}
controller.bridge({goToDefaultTab})


// -----
// exports

