'use strict';

import $ from 'jquery';


// -----
// constants


// -----
// variables


// ----- managing list of selected features
class SelectionList {
  constructor() {
    let _selectedFeatures = []   // the store

    this.get = () => [..._selectedFeatures]   // return a shallow copy

    this.add = (feature) => _selectedFeatures.push(feature)

    this.remove = (callback) => { _selectedFeatures = _selectedFeatures.filter( callback) }
  }
}


// -----
// singleton instances

const selectedGlaciers = new SelectionList()


// -----
// exports

module.exports = {
  selectedGlaciers,
}
