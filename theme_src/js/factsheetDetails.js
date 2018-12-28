
import $ from 'jquery'

import { highlightedGlacier } from './datastore'
import { Graph, configs, Queue } from './chart';

// -----
// constants

// paths on the server
const JSON_BASE = '/geo/glacier_infos'   // where per-glacier .json files live
const PIC_BASE = '/geo/glacier_images'   // where glacier pictures live

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

    // cleanup
    box.empty()   // children will be re-built
    if( box.data('lightGallery') ) {
      box.data('lightGallery').destroy(true)   // we'll put it on again at the end
    }

    // take only photos allowed to show up on factsheet
    const pics = json.facts.photos.filter( p => p.is_factsheet_picture )
    pics.forEach( (pic,ix) => {
      const url = `${PIC_BASE}/${pic.filename}`
      const legend = pic.legend
      const thumb = (0 == ix) ? `<img src="${url}">` : ''
      $(`<div data-src="${url}" data-sub-html="${legend}" class="zoomItem">${thumb}</div>`).appendTo( box)
      // TODO: pic.legend
    })

    // enable lightbox/gallery features
    box.filter('.imgGallery').lightGallery();
}


// -----
// Init

function setup(feature) {
  jQuery(".js-chart").each(function() {
    const graph = Graph(this);
    const type = $(this).data('type');
    const config = configs[type];
    const queue = Queue(config, (data) => graph.show(config, data))
    queue.load(feature.id_);
  });

  // load and fill in facts description and pictures
  fetch( feature.get('uuid') )
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
