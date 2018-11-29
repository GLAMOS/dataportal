'use strict';

import $ from 'jquery';


// -----
// constants


// -----
// variables


// ----- managing list of selected features
class SelectionList {
  constructor() {
    this.selectedFeatures = []   // the store

    this.get = this.get.bind(this)
    this.add = this.add.bind(this)
    this.remove = this.remove.bind(this)
  }

  get() {
    return [...this.selectedFeatures]   // return a shallow copy
  }

  add(feature) {
    this.selectedFeatures.push(feature)
  }

  remove(callback) {
    this.selectedFeatures = this.selectedFeatures.filter( callback)
  }
}


