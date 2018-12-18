'use strict';

/* Constants */

/* Variables */

/* Helpers */

function isFeature (feature) {
  /* NOTE: feature instanceof Vector does not work (import Vector from 'ol/source/Vector') */
  return typeof feature == 'object'
    && 'getId' in feature
    && 'ol_uid' in feature
    && 'values_' in feature;
}


/* Keeping track of current site navigation state */

/* Active page (from CMS navigation) */
const currentPage = null;

/* Active monitoring sidepane content */
const sidepane = null;

/* Active Download tab */
const downloadTab = null;


/**
 * Manages the set of features
 */
class FeatureSet {
  constructor () {
    let _data = [];   // the store

    this.set = (features) => { _data = features; };

    this.getAll = () => [..._data];   /* return a shallow copy */

    this.findById = (id) => _data.find((feat) => feat.getId() == id);
  }
}

/**
 * Manages the single highlighted/selected feature
 */
class SingleSelection {
  constructor () {
    /**
     * Data storage
     */
    let _data = null;

    this.get = () => _data;

    this.set = (id) => { _data = id; };

    this.clear = () => { _data = null; };
  }

  /* by accessing .feature, it will be transformed from/to id */
  get feature () { return features.findById(this.get()); }
  set feature (feature) { return this.set(feature.getId()); }
}


/**
 * Manages the list of selected features
 */
class SelectionList {
  constructor () {
    /**
     * Data storage
     * @type {Array}
     */
    let _data = [];

    /* allows polyvalence */
    const _ensureId = ((idORfeat) => (isFeature(idORfeat) ? idORfeat.getId() : idORfeat));

    this.set = (args) => { _data = args.map(_ensureId); };

    this.get = () => [..._data];   // return a shallow copy

    this.add = (arg) => _data.includes(_ensureId(arg)) || _data.push(_ensureId(arg));

    this.remove = (arg) => {
      if (typeof arg == 'function') {   // by callback on features
        _data = this.features.filter(arg).map((feature) => feature.getId());
      } else {   // by id
        _data = _data.filter((id) => id != arg);
      }
    };

    this.clear = () => { _data = []; };

    this.findById = (id) => _data.includes(id) && features.findById(id);
  }

  /**
   * Return the features with the stored IDs
   *
   * @return {Array[Feature]}
   */
  get features () { return this.get().map(features.findById).filter((feature) => !!feature); }
}


/* Singleton instances */

const features = new FeatureSet();
const highlightedGlacier = new SingleSelection();
const selectedGlaciers = new SelectionList();


/* Exports */

const datastore = {
  features,
  highlightedGlacier,
  selectedGlaciers,
  downloadTab,
};

module.exports = datastore;
window.dbg_data = datastore;   // for easier debugging
