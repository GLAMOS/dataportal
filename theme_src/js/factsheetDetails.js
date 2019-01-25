
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
    // swap content
    box.empty().append(data)
    // hide if no contents
    const contentcount = data && data.filter( d => undefined != d).length
    box.toggle(!!contentcount)
}

/**
* populates template description and citation/quotation node with data from per-glacier JSON
* (also handles the case where there is multiple texts for current lang)
*/
function clearPopulated() {
  populate( SEL_DESCRIPTION, null)
  populate( SEL_CITATION, null)
  populate( SEL_PHOTO, null)
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

    // escape and format textual content
    const format = (str) => {
      if( undefined == str) return str
      // transform each line to a <p>, .text escapes
      const content = str.split(/\n/).map( line => $('<p></p>').text(line) )
      // wrap everything in a <div>
      return $('<div></div>').append(content)
    }

    // add description(s)
    populate( SEL_DESCRIPTION, texts.map( t => format(t.description) ) )

    // add citation/quotation
    populate( SEL_CITATION, texts.map( t => format(t.citation) ) )
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
    const pics = json.pictures.sort( p => p.is_factsheet_picture ? -1 : +1 )
    const content = pics.map( (pic,ix) => {
      const url = `${PIC_BASE}/${pic.filename}`
      const gallery_attributes = { 'data-src': url, 'data-sub-html': pic.legend }
      // note: using .attr() escapes values
      const thumb = (0 == ix) ? $('<img />').attr( 'src', url) : ''
      return $('<div class="zoomItem"></div>').attr(gallery_attributes).append(thumb)
    })
    populate( SEL_PHOTO, content)

    // enable lightbox/gallery features
    box.filter('.imgGallery').lightGallery();
}


// -----
// Init

function setup(feature) {
  const chartBoxes = $('.fsChart');

  // Only show chart boxes when we have data
  chartBoxes.hide();

  chartBoxes.each(function() {
    const box = $(this);
    const container = box.find('.js-chart');
    const options = container.data();
    options.showNames = false;

    // Box needs to be shown before the chart is generated so it gets
    // the right height.
    const chart = Chart(container[0], options, () => box.show());
    chart.update([feature.getId()]);
  });

  // load and fill in facts description and pictures
  fetch( feature.get('pk_glacier') )   // pk_glacier is the glacier's UUID
  .fail( () => {
    clearPopulated()
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
