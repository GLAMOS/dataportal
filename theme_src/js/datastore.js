'use strict';


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
    let data = null   // the store

    this.get = () => data

    this.set = (id) => { data = id }

    this.clear = () => { data = null }
 }

  // by accessing .feature, it will be transformed from/to id
  get feature() { return features.findById( this.get() ) }
  set feature(feature) { return this.set( feature.getId() ) }
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


// ----- managing set of features

let downloadTab = null


// -----
// singleton instances

const features = new FeatureSet()
const highlightedGlacier = new SingleSelection()
const selectedGlaciers = new SelectionList()


// -----
// exports

const datastore = {
  features,
  highlightedGlacier,
  selectedGlaciers,
  downloadTab,
}

module.exports = datastore
window.dbg_data = datastore   // for easier debugging
