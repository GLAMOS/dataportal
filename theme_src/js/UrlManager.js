'use strict';

// -----
// constants


// -----
// variables


// ----- TODO

class UrlManager {
  constructor() {

    this.getIdFromUrl = () =>
        decodeURIComponent(( window.location.hash.match(/^#?(.+)/) || [, ""] )[1])

    this.setId = (id) => { window.location.hash = id }
    //TODO: OR encodeURIComponent(id)

    this.navigateTo = (href) =>
        window.location.href = href + window.location.hash;

    this.switchTo = (HREF_VALUE) => {
      //add hash to url
      if (history.pushState) {
        history.pushState(null, null, HREF_VALUE);
      }
      else {
        location.hash = HREF_VALUE;
      }
    }

  }
}

// -----
// exports

export default new UrlManager

//module.exports = {
//}
