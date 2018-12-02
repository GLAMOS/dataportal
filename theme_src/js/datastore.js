'use strict';


// -----
// constants


// -----
// variables


// ----- managing set of features
class FeatureSet {
  constructor() {
    let _data = []   // the store

    this.set = (features) => { _data = features }

    this.getAll = () => [..._data]   // return a shallow copy

    this.findById = (id) => _data.find( feat => feat.getId() == id )
  }
}


// ----- managing the single highlighted/selected feature
class SingleSelection {
  constructor() {
    let _data = null   // the store

    this.get = () => _data

    this.set = (id) => { _data = id }

    this.clear = () => { _data = null }
 }

  // by accessing .feature, it will be transformed from/to id
  get feature() { return features.findById( this.get() ) }
  set feature(feature) { return this.set( feature.getId() ) }
}


// ----- managing list of selected features
class SelectionList {
  constructor() {
    let _data = []   // the store

    // allows polyvalence
    const _ensureId = (idORfeat) =>
      Array.isArray(idORfeat) ? idORfeat : idORfeat.getId()

    this.set = (args) => { _data = args.map(_ensureId) }

    this.get = () => [..._data]   // return a shallow copy

    this.add = (arg) => _data.includes( _ensureId(arg) ) || _data.push( _ensureId(arg) )

    this.remove = (callback) => { _data = this.features.filter(callback).map( f => f.getId() ) }

    this.clear = () => { _data = [] }

    this.findById = (id) => _data.includes(id) && features.findById(id)
  }

  // by accessing .features, the ids will be transformed to feature objs
  get features() { return this.get().map( features.findById ).filter( f => !!f ) }
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
