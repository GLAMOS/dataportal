
import $ from 'jquery'

import { highlightedGlacier } from './datastore'
import { Chart, Selection } from './chart';

// -----
// constants

// paths on the server
const JSON_BASE = '/geo/glacier_infos'   // where per-glacier .json files live
const PIC_BASE = '/geo/glacier_images'   // where glacier pictures live

// CSS selectors of factsheet blocks
const SEL_DESCRIPTION = '.fsComment'   // needs attribute data-lang
const SEL_CITATION = '.fsQuotation'   // (same language as SEL_DESCRIPTION)
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

/**
 * populates a content box or hides it
 */
function populate( selector, data) {
    const box = $(selector)
    // clear old contents, hide so empty one will remain hidden
    box.empty().hide()
    // rebuild fresh
    data.forEach( bit =>
        bit && box.append( $.parseHTML(bit) ).show()
    )
}


// -----
// Factsheet textual description blocks

/**
 * populates template description and citation/quotation node with data from per-glacier JSON
 * (also handles the case where there is multiple texts for current lang)
 */
function populateDescription(json) {
    if( !json || !json.texts) {
      // either something went wrong or this glacier doesn't have any photos
      return
    }

    const lang = $(SEL_DESCRIPTION).attr('data-lang')
    const texts = json.texts.filter( d => d.language == lang)

    // formats textual content and wraps it in a <p> tag
    const format = (str) => {
      const content = str.replace(/\n/, '<br />')
      return `<p>${content}</p>`
    }

    // add description(s)
    populate( SEL_DESCRIPTION, texts.map( t => t.description && format(t.description) ) )

    // add citation/quotation
    populate( SEL_CITATION, texts.map( t => t.citation && format(t.citation) ) )
}


// -----
// Factsheet photo block (single lightbox-ish block)

/**
 * populates template picture collection with data from per-glacier JSON
 */
function populatePhotos(json) {
    if( !json || !json.pictures) {
      // either something went wrong or this glacier doesn't have any photos
      return
    }

    const box = $(SEL_PHOTO)
    // cleanup
    if( box.data('lightGallery') ) {
      box.data('lightGallery').destroy(true)   // we'll put it on again at the end
    }

    // take only photos allowed to show up on factsheet
    const pics = json.pictures.filter( p => p.is_factsheet_picture )
    const content = pics.map( (pic,ix) => {
      const url = `${PIC_BASE}/${pic.filename}`
      const legend = pic.legend
      const thumb = (0 == ix) ? `<img src="${url}">` : ''
      return `<div data-src="${url}" data-sub-html="${legend}" class="zoomItem">${thumb}</div>`
    })
    populate( SEL_PHOTO, content)

    // enable lightbox/gallery features
    box.filter('.imgGallery').lightGallery();
}


// -----
// Init

function setup(feature) {
  $(".js-chart").each(function() {
    const chart = Chart(this);
    chart.update(Selection($(this).data('type'), [feature.getId()]));
  });

  // load and fill in facts description and pictures
  fetch( feature.get('pk_glacier') )   // pk_glacier is the glacier's UUID
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
