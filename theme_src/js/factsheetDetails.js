
import $ from 'jquery'


// -----
// constants

// paths on the server
const JSON_BASE = '/geo'   // where per-glacier .json files live  //TODO
const PIC_BASE = '/tmp'   // where glacier pictures live  //TODO

// CSS selectors of factsheet blocks
const SEL_DESCRIPTION = '.fsComment'   // needs attribute data-lang
const SEL_PHOTO = '.fsPhoto'


// -----
// variables


// -----
// helpers

/**
 * gets a per-glacier JSON from the server
 * @return a jQuery Deferred (jqXHR)
 */
function fetch(basename, cb) {
  const url = `${JSON_BASE}/${basename}.json`
  return $.getJSON(url, cb)
}


// -----
// Factsheet textual description blocks

/**
 * populates template description node with data from per-glacier JSON
 * (also handles the case where there is multiple texts for current lang)
 */
function populateDescription(json) {
    const box = $(SEL_DESCRIPTION)
    const prevSibling = box.prev()
    const lang = box.attr('data-lang')

    if( !json || !json.facts || !json.facts.descriptions) {
      // either something went wrong or this glacier doesn't have any photos
      return
    }

    const texts = json.facts.descriptions.filter( d => d.language == lang)
    box.detach()
    texts.forEach( txt =>
        box.clone().html( txt.description ).insertAfter( prevSibling )
    )
}


// -----
// Factsheet photo block (single lightbox-ish block)

/**
 * populates template picture collection with data from per-glacier JSON
 */
function populatePhotos(json) {
    const box = $(SEL_PHOTO)

    if( !json || !json.facts || !json.facts.photos) {
      // either something went wrong or this glacier doesn't have any photos
      return
    }

    const pics = json.facts.photos
    pics.forEach( (pic,ix) => {
      const url = `${PIC_BASE}/${pic.filename}`
      const thumb = (0 == ix) ? `<img src="${url}">` : ''
      $(`<div data-src="${url}" class="zoomItem">${thumb}</div>`).appendTo( box)
      // TODO: pic.legend
    })

    // enable lightbox/gallery features
    box.filter('.imgGallery').lightGallery();
}


// -----
// Init

function setup() {
  // load and fill in facts description and pictures
  //TODO: for current glacier
  fetch('web_glacier_details_json-sample')
  .fail( () => {
    console.error( "failed to fetch" )
  })
  .done( populateDescription)
  .done( populatePhotos)
}


// -----
// exports

module.exports = {
  setup,
}
