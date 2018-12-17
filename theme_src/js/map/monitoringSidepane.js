
import controller from '../controller'
import datastore from '../datastore'   // the one feature (glacier) which is selected


// -----
// constants

// CSS selectors
const GRID_WRAPPER = '.gridMapViewer'
const TOGGLES = '.navSidebarToggle'
const SIDEBAR_CONTENT_CONTAINER = '.sidebarContainer'

/*
 * The values of the toggles' data-tab attribute are directly the CSS classes
 * of the corresponding content box nodes.
 * (references: templates/_pages/mapViewer.twig theme_src/scss/atoms/navToggleButton.scss
 * DEFAULT_PANE is one of those.
 */
const DEFAULT_PANE = 'comparisonContainer'


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

  // jQuery elements
  const toggles = $(TOGGLES)
  const sidePaneContents = $(SIDEBAR_CONTENT_CONTAINER).children()
  const parents = ($el) => $el.parentsUntil(GRID_WRAPPER)

  // CSS classNames
  const CLS_ACTIVE = 'active'
  const CLS_HIDE = 'hidden'

  // reset to unhighlight toggle and hide all content
  toggles.removeClass(CLS_ACTIVE)
  sidePaneContents.removeClass(CLS_ACTIVE)
  parents(sidePaneContents).removeClass(CLS_ACTIVE)

  // show/highlight what needs to be
  toggles.filter(`[data-tab="${tabName}"]`).addClass(CLS_ACTIVE)
  const sidepaneActualContent = sidePaneContents.filter(`.${tabName}`)
  sidepaneActualContent.addClass(CLS_ACTIVE)
  parents(sidepaneActualContent).addClass(CLS_ACTIVE)
}


// -----
// Tab switching

function goToSidebarTab( tabName=DEFAULT_PANE) {
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
