'use strict';

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

    // get from / set to hash
    const _getFullHash = () => {
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
    }

  }
}

// -----
// exports

export default new UrlManager()

//module.exports = {
//}
