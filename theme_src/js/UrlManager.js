'use strict';

import datastore from './datastore'


// -----
// constants


// -----
// variables


// ----- URL/Navigation/History Manager


class UrlManager {
  constructor() {

    // LEGACY (ported)

    this.getIdFromUrl = () =>
        // RFC-3986 tells '#' is not part of fragment identifier, but browsers do. We drop it
        decodeURIComponent( window.location.hash.replace(/^#/, '') )

    // @usage selectGlacier (i.e. via marker or search)
    this.setId = (id) => { window.location.hash = id }
    //TODO: OR encodeURIComponent(id)

    // @param href  URL without hash
    // @usage page tabs (activated by dynamicLinks)
    this.navigateTo = (href) =>
        // if href part changes, navigate; otherwise just add history entry
        window.location.href = href + window.location.hash;

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

    const id2hash = encodeURIComponent
    const hash2id = decodeURIComponent
    const feat2id = feat => feat.getId()
    const id2feat = function (...args) { return datastore.features.findById(...args); }

    const _getCurrentPage = () =>
        window.location.pathname.split('/').slice(-1)[0]

    // map layers: baselayers, div. featurelayers
    const _getLayerHashPart = () => {
      const page = _getCurrentPage()
      if( 'downloads' == page ) {
        return [datastore.downloadTab]
      }
      return []   // fallback
    }

    const _setLayersFromHashPart = (hashes) => {
      const page = _getCurrentPage()
      if( 'downloads' == page ) {
        datastore.downloadTab = hashes[0]
      }
    }

    // features (glaciers)
    const _getFeatureHashPart = () => {
      const highlighted = datastore.highlightedGlacier.get()
      const selectedNonActive = datastore.selectedGlaciers.get().filter(
          id => highlighted != id
      )
      const highlightedAry = highlighted ? [highlighted] : []
      return [ ...highlightedAry, ...selectedNonActive ].map(id2hash)
    }

    const _setFeaturesFromHashPart = (hashes) => {
      const features = hashes.map(hash2id).map(id2feat)
          .filter( f => f )   // skip undefined ones
      if( features.length)  datastore.highlightedGlacier.feature = features[0]
      datastore.selectedGlaciers.set( features)
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

    this.decodeFullHash = () => {
      const hash = window.location.hash.replace(/^#/, '')
      // console.debug('UrlManager.decodeFullHash', hash)
      const [ layerPart, featurePart ] = hash.split('/')
      layerPart && _setLayersFromHashPart( layerPart.split('&') )
      featurePart && _setFeaturesFromHashPart( featurePart.split('&') )
      // console.debug('UrlManager.decodeFullHash end', baseLayers, datastore.selectedGlaciers.get(), datastore.highlightedGlacier.get())
    }

  }
}

// -----
// exports

export default new UrlManager()

//module.exports = {
//}
