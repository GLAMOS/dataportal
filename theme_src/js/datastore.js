'use strict';

import $ from 'jquery';


// -----
// constants


// -----
// variables


// ----- managing the single highlighted/selected feature
class SingleSelection {
  constructor() {
    let _selectedFeature = null   // the store

    this.get = () => _selectedFeature

    this.set = (feature) => { _selectedFeature = feature }

    this.clear = () => { _selectedFeature = null }
 }

  // by accessing .feature, we may avoid the need to set using parentheses: .set(foo)
  get feature() { return this.get() }
  set feature(feature) { return this.set(feature) }
}


// ----- managing list of selected features
class SelectionList {
  constructor() {
    let _selectedFeatures = []   // the store

    this.get = () => [..._selectedFeatures]   // return a shallow copy

    this.add = (feature) => _selectedFeatures.includes(feature) || _selectedFeatures.push(feature)

    this.remove = (callback) => { _selectedFeatures = _selectedFeatures.filter( callback) }

    this.clear = () => { _selectedFeatures = [] }
  }
}


// -----
// singleton instances

const highlightedGlacier = new SingleSelection()
const selectedGlaciers = new SelectionList()


// -----
// exports

module.exports = {
  highlightedGlacier,
  selectedGlaciers,
}
