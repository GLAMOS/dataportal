
import $ from 'jquery'


// -----
// constants

console.error('TODO: change JSON_BASE')//TODO:TODO:TODO
const JSON_BASE = 'http://localhost:8080/geo'
const PIC_BASE = 'http://localhost:8080/data/'   //TODO

// CSS selectors of factsheet blocks
const SEL_DESCRIPTION = '.fsComment'   // needs attribute data-lang
const SEL_PHOTO = '.fsPhoto'


// -----
// variables


// -----
// helpers

function fetch(basename, cb) {
  const url = `${JSON_BASE}/${basename}.json`
  return $.getJSON(url, cb)
}


// -----
// Factsheet textual description blocks

function populateDescription(json) {
    const box = $(SEL_DESCRIPTION)
    const prevSibling = box.prev()
    const lang = box.attr('data-lang')
    // TODO: harden
    const texts = json.facts.descriptions.filter( d => d.language == lang)
    box.detach()
    texts.forEach( txt =>
        box.clone().html( txt.description ).insertAfter( prevSibling )
    )
}


// -----
// Factsheet photo block (single lightbox-ish block)

function populatePhotos(json) {
    const box = $(SEL_PHOTO)
    // TODO: harden
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
  // load and fill in facts description
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
