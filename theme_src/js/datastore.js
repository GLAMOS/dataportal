'use strict';

import $ from 'jquery';


// -----
// constants


// -----
// variables


// ----- managing set of features
class FeatureSet {
  constructor() {
    let data = []   // the store

    this.set = (features) => { data = features }

    this.getAll = () => [...data]   // return a shallow copy

    this.findById = (id) => data.find( feat => feat.getId() == id )
  }
}


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

    this.set = (features) => { _selectedFeatures = features }

    this.get = () => [..._selectedFeatures]   // return a shallow copy

    this.add = (feature) => _selectedFeatures.includes(feature) || _selectedFeatures.push(feature)

    this.remove = (callback) => { _selectedFeatures = _selectedFeatures.filter( callback) }

    this.clear = () => { _selectedFeatures = [] }

    this.findById = (id) => _selectedFeatures.find( feat => feat.getId() == id )
  }
}


// -----
// singleton instances

const features = new FeatureSet()
const highlightedGlacier = new SingleSelection()
const selectedGlaciers = new SelectionList()


// -----
// exports

module.exports = {
  features,
  highlightedGlacier,
  selectedGlaciers,
}
