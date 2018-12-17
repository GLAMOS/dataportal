
import controller from '../controller'
import datastore from '../datastore'   // the one feature (glacier) which is selected


// -----
// constants

const GRID_WRAPPER = '.gridMapViewer'
const TOGGLES = '.navSidebarToggle'
const SIDEBAR_CONTENT_CONTAINER = '.sidebarContainer'

// are directly the CSS classes of the corresponding box nodes
// (references: templates/_pages/mapViewer.twig theme_src/scss/atoms/navToggleButton.scss
const SIDE_GLACIERS = 'sidebarControls'
const SIDE_LAYERS = 'layerSwitcher'
const SIDE_MEASURE = 'latestMeasurements'   // separated only for mobile


// -----
// variables


// -----
// helpers


// -----
// toggling button actions

function setup() {
  $(TOGGLES).on('click', (ev) => {
    ev.preventDefault()
    goToSidebarTab( ev.currentTarget.getAttribute('data-tab') )
  })
}


// -----
// Rendering

function render() {
  const tabName = datastore.sidepane
  const pane = $(SIDEBAR_CONTENT_CONTAINER)
  const topContentContainer = $(GRID_WRAPPER)
  const CLS_ACTIVE = 'active'
  const CLS_HIDE = 'hidden'

  // reset to unhighlight toggle and hide all content
  $(TOGGLES).removeClass(CLS_ACTIVE)
  $('> *', pane).removeClass(CLS_ACTIVE)
  .parentsUntil(topContentContainer).removeClass(CLS_ACTIVE)

  // show/highlight what needs to be
  $(`${TOGGLES}[data-tab="${tabName}"]`).addClass(CLS_ACTIVE)
  $(`.${tabName}`, pane).addClass(CLS_ACTIVE)
  .parentsUntil(topContentContainer).addClass(CLS_ACTIVE)
}


// -----
// Tab switching

function goToSidebarTab( tabName=SIDE_GLACIERS) {
  // TODO: if mobile, leave sidepane closed (=null(?))
  datastore.sidepane = tabName
  render()
}
controller.bridge({goToSidebarTab})


// -----
// exports

module.exports = {
  setup,
}
