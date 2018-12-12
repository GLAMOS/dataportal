
import controller from '../controller'
import datastore from '../datastore'   // the one feature (glacier) which is selected


// -----
// constants

const TOGGLES = '.navSidebarToggle'

// are directly the CSS classes of the corresponding box nodes
const SIDE_GLACIERS = 'sidebarControls'
const SIDE_LAYERS = 'layerswitcher'
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
  const pane = $('.sidebarContainer')
  const CLS_ACTIVE = 'active'
  const CLS_HIDE = 'hidden'

  // reset to unhighlight toggle and hide all content
  $(TOGGLES).removeClass(CLS_ACTIVE)
  $('> *', pane).addClass(CLS_HIDE)

  // show/highlight what needs to be
  $(`${TOGGLES}[data-tab="${tabName}"]`).addClass(CLS_ACTIVE)
  $(`.${tabName}`, pane).removeClass(CLS_HIDE)
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
