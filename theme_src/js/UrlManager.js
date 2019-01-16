'use strict';

//import $ from 'jquery';

import datastore from './datastore'
import controller from './controller'


// -----
// constants


// -----
// variables


// ----- URL/Navigation/History Manager

/* URI scheme sketches:
 *  - '/' for nesting of references
 *  - '&' for lists/same-level
 *  - highlighted feature is implicitely part of selected feature list
 *    aka: highlighted shall be the first of the full selected feature list
 * Examples:
 *  https://glamos.meteotest.ch/factsheet#historic&1990&2000/B43%2F03&A41%2F54&A44%2F49
 *  ^^^ base URL                ^page     ^active layers     ^highlight ^selected features
 *  https://glamos.meteotest.ch/download#tab1&GR/B43%2F03&A41%2F54&A44%2F49
 *  ^^^ base URL                ^page   tab^  ^anchor ^highlight ^selected features
 */

/* Navigation UX:
 * - highlighting a different layer:
 *  - if on Monitoring, just update URI (for direct link), but not history
 *  - otherwise update history
 * - adding/removing a layer to the selection (highlights at the same time): update histo
 * - changing chart type: just update URI
 * - toggling map layer: just update URI
 * - change download tab: update history
 */

class UrlManager {
  constructor() {

    // @param href  URL without hash
    // @usage page tabs (activated by dynamicLinks)
    this.navigateTo = function(href) {
      const url = href + _getFullHash();
      // if href part changes, navigate; otherwise just add history entry
      window.location.href = url;
    }

    // @param hash  of the mini-tab
    // @usage navigation between download (mini-)tabs
    this.switchTo = (HREF_VALUE) => {
      //add hash to url
      if (history.pushState) {
        // note: no hashchange event fired
        history.pushState(null, null, HREF_VALUE);
      }
      else {
        // no new history entry if hash does not change
        location.hash = HREF_VALUE;
      }
    }

    // REDESIGNED

    // private

    // helpers
    const id2hash = encodeURIComponent
    const hash2id = decodeURIComponent
    const feat2id = feat => feat.getId()
    const id2feat = function (...args) { return datastore.features.findById(...args); }

    const _getCurrentPage = () =>
        window.location.pathname.split('/').slice(-1)[0]

    // map layers: baselayers, div. featurelayers
    const _getLayerHashPart = () => {
      if( 'downloads' == datastore.currentPage ) {
        return [datastore.downloadTab]
      }
      return []   // fallback
    }

    const _setLayersFromHashPart = (hashes) => {
      if( 'downloads' == datastore.currentPage ) {
        datastore.downloadTab = hashes[0]
      }
    }

    // features (glaciers)
    const _getFeatureHashPart = () => {
      const candidates = [
        datastore.highlightedGlacier.get(),
        ...datastore.selectedGlaciers.get()];

      const selected = [];
      for (let id of candidates) {
        if (id && selected.indexOf(id) < 0) selected.push(id);
      }
      return selected.map(id2hash);
    }

    const _setFeaturesFromHashPart = (hashes) => {
      const ids = hashes.map(hash2id)
      if( ids.length)  datastore.highlightedGlacier.set( ids[0] )
      datastore.selectedGlaciers.set( ids)
    }

    // get from / set to hash
    const _getFullHash = () => {
      const fullHash = '#' + [
          _getLayerHashPart().join('&'),
          _getFeatureHashPart().join('&'),
      ].join('/')
      return fullHash
    }

    // public

    /// just updates the URL hash shown in browser, without history entry
    this.minorUpdate = () => {
      const newHash = _getFullHash()
      console.debug('UrlManager.minorUpdate', newHash)
      if( window.history && window.history.replaceState) {
        window.history.replaceState(null, null, newHash)
      } else {
        // src: https://stackoverflow.com/a/21782734
        $(window).unbind( 'hashchange');
        window.location.hash = hash;
        $(window).bind( 'hashchange');
      }
    }

    /// adds an entry to the history with the updated URL hash
    this.majorUpdate = () => {
      const newHash = _getFullHash()
      console.debug('UrlManager.majorUpdate', newHash)
      if( window.history && window.history.pushState) {
        window.history.pushState(null, null, newHash)
      } else {
        window.location.hash = hash;
      }
    }

    /**
     * Decodes the URL hash and populates the datastore
     */
    this.loadState = () => {
      datastore.currentPage = _getCurrentPage()
      const hash = window.location.hash.replace(/^#/, '')
      // console.debug('UrlManager.loadState', hash)
      const [ layerPart, featurePart ] = hash.split('/')
      layerPart && _setLayersFromHashPart( layerPart.split('&') )
      featurePart && _setFeaturesFromHashPart( featurePart.split('&') )
      // console.debug('UrlManager.loadState end', datastore.downloadTab, datastore.selectedGlaciers.get(), datastore.highlightedGlacier.get())
    }

    /**
     * Hooks up history navigation callback (managed by controller)
     */
    this.observeHistory = () => {
      window.onhashchange = () => controller.onNavigate()
    }

  }
}

// -----
// exports

export default new UrlManager()

//module.exports = {
//}
