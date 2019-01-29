
/** Translation helper for data-translations attributes
 *
 * translation strings get passed from Craft by twig via data-translations attribute
 *
 * NOTE: you need to add the translation strings in your twig template to get it out of Craft!
 *
 * @param selector of the element where data-translations attribute is attached to
 * @return a simple function which attempts to translate the string passed to it
 */
function Translation(selector) {
  // get the translation strings from data attribute
  // note: taking two steps (sel,filter) to allow allow passing in a node or jQuery object
  // note: .data() parses as much as possible!
  const translations = $(selector).filter('[data-translations]').data('translations') || {}

  // attempt to translate a string
  const translateString = (str) => translations[str] || str

  // "contructor" simply returning the translation function
  return translateString
}

export default Translation
