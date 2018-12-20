

// -----
// constants

console.error('TODO: change JSON_BASE')//TODO:TODO:TODO
const JSON_BASE = 'http://localhost:8080/geo'

// CSS selectors of factsheet blocks
const SEL_DESCRIPTION = '.fsComment'   // needs attribute data-lang


// -----
// variables


// -----
// helpers

function fetch(basename, cb) {
  const url = `${JSON_BASE}/${basename}.json`
  return $.getJSON(url, cb)
}


// -----
// Init

function setup() {
  // load and fill in facts description
  fetch('web_glacier_details_json-sample')
  .fail( () => {
    console.error( "failed to fetch" )
  })
  // textual description
  .done( json => {
    const box = $(SEL_DESCRIPTION)
    const prevSibling = box.prev()
    const lang = box.attr('data-lang')
    // TODO: harden
    const texts = json.facts.descriptions.filter( d => d.language == lang)
    box.detach()
    texts.forEach( txt =>
        box.clone().html( txt.description ).insertAfter( prevSibling )
    )
  })
}


// -----
// exports

module.exports = {
  setup,
}
