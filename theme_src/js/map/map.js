/*global $: true */
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import Image from 'ol/layer/Image';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import bbox from 'ol/loadingstrategy';
import Circle from 'ol/style/Circle';
import { Icon, Style, Stroke, Fill } from 'ol/style';
import { defaults as Interactions } from 'ol/interaction';
import { defaults as Control } from 'ol/control';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import glacier_vip from './layer/glacier_vip';
import { pixel_500px, pixel_1000px, eiszeit } from './layer/swisstopo_layer';
import { glamos_sgi_1850, glamos_sgi_1973, glamos_sgi_2010 } from './layer/glamos_layer';

import controller from '../controller';
import urlManager from '../UrlManager';
import {
  /* Selected feature (glacier) */
  highlightedGlacier,

  /* List of features (glaciers) for comparison */
  selectedGlaciers
} from '../datastore';


const DISPLAY_NAME = 'glacier_short_name';

const hidePoints = new Style({
  image: new Circle(({
    radius: 0,
    fill: new Fill({
      color: 'black'
    })
  }))
});

const noDataGlacierStyle = new Style({
  image: new Circle(({
    radius: 2,
    fill: new Fill({
      color: 'black'
    })
  }))
});

const selectableStyleSmall = new Style({
  image: new Circle(({
    radius: 5,
    fill: new Fill({
      color: 'black',
      stroke: '#380303',
      zIndex: 50
    })
  }))
});

const hoverStyleSmall = new Style({
  image: new Circle(({
    radius: 5,
    fill: new Fill({
      color: '#380303',
      stroke: '#380303',
      zIndex: 100
    })
  }))
});

const defaultGlacierStyle = new Style({
  image: new Circle(({
    radius: 5,
    fill: new Fill({
      color: 'red',
    })
  }))
});

const hoverStyle = new Style({
  image: new Icon(({
    src: '/theme/img/pin-hover.svg',
    scale: 0.7,
    zIndex: 100
  }))
});

const selectableStyle = new Style({
  image: new Icon(({
    src: '/theme/img/pin-default.svg',
    scale: 0.7
  }))
});

const activeStyle = new Style({
  image: new Icon(({
    src: '/theme/img/pin-active.svg',
    scale: 0.7,
    zIndex: 1000
  }))
});

/* FIXME: Use Array */
const style = {};
style[0] = noDataGlacierStyle;
style[1] = defaultGlacierStyle;
style[2] = selectableStyle;
style[3] = selectableStyleSmall;
style[4] = hidePoints;

function filterFeature (feature) {
  /* Keine Werte */
  const has_mass_value = feature.get('has_mass_value');
  const has_length_value = feature.get('has_length_value');

  if (has_mass_value == 't' || has_length_value == 't') return true;

  return false;
}

function switchStyle (feature, resolution) {
  /* DEBUG */
  // console.log(resolution);

  if (filterFeature(feature)) {
    if (resolution > 100) {
      return [style[3]];
    }

    return [style[2]];
  }

  /* No data → noDataGlacierStyle */
  return [style[0]];
}

const unit = function (x) {
  if (x >= -999 && x <= 999) return `${x} m`;

  return `${Math.round(x / 100) / 10} km`;
};

function fillSchluesseldaten (featureId, page) {
  console.log(`fillSchlüsseldaten: ${page}`);
  const infoboxGlacierName = document.getElementsByClassName('infobox-glaciername');
  const infoboxLengthCumulative = document.getElementsByClassName('infobox-length--cumulative');
  const infoboxMassCumulative = document.getElementsByClassName('infobox-mass--cumulative');
  const infoboxLengthTimespan = document.getElementsByClassName('infobox-length--timespan');
  const infoboxMassTimespan = document.getElementsByClassName('infobox-mass--timespan');
  const infoboxLengthDuration = document.getElementsByClassName('infobox-length--duration');
  const infoboxMassDuration = document.getElementsByClassName('infobox-mass--duration');

  function updateValue (el, value) {
    for (let i = 0; i < el.length; i++) {
      el[i].innerHTML = value;
    }
  }

  console.log(infoboxGlacierName);
  if (gletscher_source.getFeatureById(featureId).get('has_mass_value') == 't') {
    updateValue(
      infoboxMassTimespan,
      `${gletscher_source.getFeatureById(featureId).get('date_from_mass').toFixed(0)}
        &ndash; ${gletscher_source.getFeatureById(featureId).get('date_to_mass').toFixed(0)}`
    );
    updateValue(
      infoboxMassDuration,
      `${gletscher_source.getFeatureById(featureId).get('mass_anzahl_jahre').toFixed(0)} Jahre`
    );
    updateValue(
      infoboxMassCumulative,
      `${unit(gletscher_source.getFeatureById(featureId).get('last_mass_change_cumulative'))}&sup3;`
    );
  }
  else {
    updateValue(infoboxMassTimespan, '--');
    updateValue(infoboxMassDuration, '--');
    updateValue(infoboxMassCumulative, '--');
  }

  if (gletscher_source.getFeatureById(featureId).get('has_length_value') == 't') {
    updateValue(
      infoboxLengthTimespan,
      `${gletscher_source.getFeatureById(featureId).get('date_from_length').toFixed(0)}
        &ndash; ${gletscher_source.getFeatureById(featureId).get('date_to_length').toFixed(0)}`
    );
    updateValue(
      infoboxLengthDuration,
      `${gletscher_source.getFeatureById(featureId).get('length_anzahl_jahre').toFixed(0)} Jahre`
    );
    updateValue(
      infoboxLengthCumulative,
      unit(gletscher_source.getFeatureById(featureId).get('last_length_change_cumulative'))
    );
  }
  else {
    updateValue(infoboxLengthTimespan, '--');
    updateValue(infoboxLengthDuration, '--');
    updateValue(infoboxLengthCumulative, '--');
  }
  updateValue(infoboxGlacierName, gletscher_source.getFeatureById(featureId).get(DISPLAY_NAME));

  if (page == 'factsheet') {
    updateValue(infoboxGlacierName, gletscher_source.getFeatureById(featureId).get(DISPLAY_NAME));
  }
}

// function remove_first_occurrence(str, searchstr)       {
// 	var index = str.indexOf(searchstr);
// 	if (index === -1) {
// 		return str;
// 	}
// 	return str.slice(0, index) + str.slice(index + searchstr.length);
// }

/**
 * Monitoring: Selection List
 */
class SelectionList {
  constructor (datastoreList) {
    this.store = datastoreList;
    this.svgClose =
      `<svg id="Ebene_1" data-name="Ebene 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <title>close</title>
        <path d="M305.5,256,473.75,87.75a35,35,0,0,0-49.5-49.5L256,206.5,87.75,38.25a35,35,0,0,0-49.5,49.5L206.5,256,38.25,424.25a35,35,0,0,0,49.5,49.5L256,305.5,424.25,473.75a35,35,0,0,0,49.5-49.5Z"></path>
      </svg>`;

    this.add = this.add.bind(this);
    this.reset = this.reset.bind(this);
    this.renderEntry = this.renderEntry.bind(this);

    /* Hook up reset callback only once (thus done in contructor) */
    $('#monitoring-glacier--list + button[name="reset"]').on('click', this.reset);
  }

  add (feature) {
    this.store.add(feature);
    this.refresh();
  }

  select (id) {
    id = id.replace('--list', '');
    controller.selectionListHighlight(id);
    this.refresh();
  }

  remove (id) {
    id = id.replace('--close', '');
    controller.selectionListRemove(id);
    this.refresh();
  }

  reset () {
    controller.selectionListReset();
    this.refresh();
  }

  /* TODO: Implement reset via button */

  refresh () {
    const contents = this.store.features.map(this.renderEntry);
    const container = $('#monitoring-glacier--list');
    container.html(contents)
      .find('[name="highlight"]').on('click', (ev) => this.select(ev.currentTarget.id))
      .end()
      .find('[name="remove"]')
      .on('click', (ev) => this.remove(ev.currentTarget.id))
      .end();
  }

  renderEntry (feature) {
    const auxClass = (feature == highlightedGlacier.feature) ? 'active' : '';
    const id = feature.getId();
    const name = feature.get(DISPLAY_NAME);
    return `<div class="comparisonEntry ${auxClass}">
        <button type="button" name="highlight" class="glacierName" id="${id}--list">${name}</button>
        <button type="button" name="remove" class="btn close" id="${id}--close">
          ${this.svgClose}
        </button>
      </div>`;
  }
}

const monitoringSelectedFeatureList = new SelectionList(selectedGlaciers);
controller.bridge({monitoringSelectedFeatureList});

/* ----- */

function dynamicLinks () {
  $('a.js-keephash').on('click', function (e) {
    urlManager.navigateTo(this.href);
    e.preventDefault();
  });
}
controller.bridge({dynamicLinks});

/* Currently static file, should be provided by the GLAMOS server */
// var gletscher_alle = new VectorLayer({
//   source: new Vector({
//     format: new GeoJSON(),
//     url: '/geo/glamos_inventory_dummy.geojson'
//   }),
//   map: map,
//   style: switchStyle //style different depending on data availibility
// });

/**
 * Search Bar
 *
 * Used on the tabs Home, Monitoring and Factsheet
 * This function bootstratps the search bar:
 * - sets up the underlaying data
 * - attaches autocomplete to the template's input
 * - handles the select event (choosing a hit)
 */
function enableSearch (gletscher_features) {
  const searchInput = $('.fieldSearchWrapper input');

  gletscher_features = gletscher_features.filter(filterFeature);
  if (!searchInput.length || !gletscher_features.length) return;

  const searchData = gletscher_features.map((feat) => (
    { label: feat.get(DISPLAY_NAME), value: feat }
  ));

  /**
   * Keep search bar empty
   *
   * (otherwise ui.item.value shows up in <input> as "[object Object]")
   */
  function preventInputPopulation (ev) {
    /*
     * from jQuery-UI docs:
     * Cancelling (focus|select) event prevents input from being updated
     */
    ev.preventDefault();
  }

  function onSelect (ev, ui) {
    const feature = ui.item.value;
    controller.searchSelected(feature);
    preventInputPopulation(ev);

    /* Remove user-typed search string */
    $(ev.target).val('');
  }

  searchInput.autocomplete({
    minLength: 2,
    source: searchData,
    focus: preventInputPopulation,
    select: onSelect,
  });
}
controller.bridge({enableSearch});

/**
 * List of VIP glaciers
 *
 * @param  {Object} el [description]
 * @return {Object}
 * @todo data source still unclear
 */
const glacierVips = glacier_vip.features.map(function (el) {
  return el.properties;
});

const format = new GeoJSON;
const url = '/geo/glamos_inventory_dummy.geojson';

/* Default = Aletschgletscher */
let gletscher_id;  // = 'B36\/26';

/* Selected feature (glacier) */
let selected;

/**
 * Returns glacier ID from a list of 12 defined VIP glaciers
 *
 * @return {string}
 * @todo Determine number of glaciers from GeoJSON
 */
function getRandomVIP () {
  const min = 1;
  const max = 12;
  const randomNumber = Math.floor((Math.random() * (max - min)) + min);
  return glacierVips[randomNumber].pk_sgi;
}
controller.bridge({getRandomVIP});

/**
 * @type {Vector}
 * @depends
 *   map, selectedOverlay, bbox, url, activeStyle, format, self,
 *   highlightedGlacier, getRandomVIP, fillSchluesseldaten
 */
const gletscher_source = new Vector({
  strategy: bbox,
  loader (extent, resolution, projection) {
    $.ajax(url).then(function (response) {
      const features = format.readFeatures(
        response,
        { featureProjection: 'EPSG:3857' }
      );
      gletscher_source.addFeatures(features);

      /* Store features in data storage and do stuff, now that we know about them */
      controller.gotFeatures(features);
    });
  }
});

const gletscher_alle = new VectorLayer({
  name: 'Gletscher Inventar',
  source: gletscher_source,
  map,

  /* Different style depending on data availability */
  style: switchStyle
});
gletscher_alle.set('name', 'gletscher_alle');
gletscher_source.set('id', 'pk_sgi');

const selectedOverlay = new VectorLayer({
  source: new Vector(),
  map,
  style: activeStyle
});

/* 3 Map instances, one for each tab */
let page = null;
let map = null;
if (document.getElementById('factsheet-map')) {
  /* Only one map layer, static map centered on glacier (dynamically set) */
  map = new Map({
    target: 'factsheet-map',
    extent: [650000, 4000000, 1200000, 6500000],
    layers: [eiszeit],

    /* Remove all interactions, like zoom, pan etc. for factsheet window */
    interactions: [],

    /* Remove zoom for factsheet window */
    controls: [],

    view: new View({
      center: [903280, 5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 14
    })
  });

  page = 'factsheet';
  map.addLayer(gletscher_alle);
  gletscher_alle.setStyle(hidePoints);
} else if (document.getElementById('monitoring-map')) {
  map = new Map({
    target: 'monitoring-map',
    layers: [pixel_500px, pixel_1000px, eiszeit, glamos_sgi_1850, glamos_sgi_1973, glamos_sgi_2010],
    view: new View({
      extent: [650000, 4000000, 1200000, 6500000],
      center: [903280, 5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 14
    })
  });

  page = 'monitoring';
  map.addLayer(gletscher_alle);
} else if (document.getElementById('home-map')) {
  /* Only one map layer → no layer switcher */
  map = new Map({
    target: 'home-map',
    layers: [pixel_500px, pixel_1000px, eiszeit],

    /* Remove all interactions, like zoom, pan etc. for factsheet window */
    // interactions: [],

    /* Remove zoom for factsheet window */
    // controls: [],

    view: new View({
      extent: [650000, 4000000, 1200000, 6500000],
      center: [903280, 5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 14
    })
  });

  page = 'home';
  map.addLayer(gletscher_alle);
} else {
  page = 'other';
}

if (map) map.addLayer(selectedOverlay);


/* Add interactivity to the map */

/**
 * Get all features under the pointer
 * @param  {Event} browserEvent
 * @return {Array}
 * @depends map
 */
function mouse2features (browserEvent) {
  const coordinate = browserEvent.coordinate;
  const pixel = map.getPixelFromCoordinate(coordinate);
  const features = [];
  map.forEachFeatureAtPixel(pixel, (feature, layer) => features.push(feature));
  return features;
}

/**
 * Pan the map to the given feature
 *
 * @param  {Object} feature
 * @depends map
 */
function mapPanTo (feature) {
  if (!feature) return;
  const center = [feature.get('coordx'), feature.get('coordy')];
  map.getView().setCenter(center);
}
controller.bridge({mapPanTo});

/**
 * Populate Schluesseldaten, highlight selected marker
 *
 * @param  {Object} feature [description]
 * @depends page; highlightedGlacier, selectedOverlay
 */
function selectGlacier (feature) {
  if (!feature) return;

  //1. fill infobox from feature
  gletscher_id = feature.getId();
  fillSchluesseldaten(gletscher_id, page);

  //2a. reset current selection
  if (highlightedGlacier.feature) {
    try {
      selectedOverlay.getSource().removeFeature(highlightedGlacier.feature);
    } catch (e) {
      console.debug('seems highlightedGlacier was not found on selectedOverlay');
    }
  }

  //2. fuege roten Marker (selektierter Gletscher) als Overlay hinzu
  //hoverOverlay.getSource().removeFeature(hover);
  selectedOverlay.getSource().addFeature(feature);
  selected = feature;

  //TODO: if monitoring, change/update also chart (add glacier and/or highlighted this one)
}

// when the user clicks on a feature, select it
// (last one in DOM if cursor hit multiple features)
function onMapClick (browserEvent) {
  let features = mouse2features(browserEvent);
  // consider only glaciers with data
  features = features.filter(filterFeature);
  if (!features.length) return;

  //manche Gletscherpunkte sind so dicht zusammen dass mehr als einer gelesen wird
  //es wird nur das letzte feature beachtet
  controller.mapMarkerHighlighted(features[features.length - 1]);
}
controller.bridge({selectGlacier});

map && map.on('click', onMapClick);


/* add hoverstyle */
const hoverOverlay = new VectorLayer({
  source: new Vector(),
  map,
  style (_feature, resolution) {
    if (resolution > 100) {
      return hoverStyleSmall;
    }
    return hoverStyle;
  }
});

let hover;

/**
 * @param  {Object} pixel
 * @return {Object|boolean} [TODO: description]
 * @depends map, hoverOverlay, hover
 */
const featureHover = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    const has_mass_value = feature.get('has_mass_value');
    const has_length_value = feature.get('has_length_value');

    /* Hover only works if glacier has data */
    if (has_mass_value == 't' || has_length_value == 't') {
      return feature;
    }

    return false;
  });

  if (feature !== hover && feature !== selected) {
    if (hover) {
      hoverOverlay.getSource().removeFeature(hover);
    }
    if (feature) {
      hoverOverlay.getSource().addFeature(feature);
    }
    hover = feature;
  }
};

if (map)
{
  /* Add “hand” pointer */
  map.on('pointermove', function (e) {
    if (e.dragging) return;

    const pixel = map.getEventPixel(e.originalEvent);
    const hit = map.forEachFeatureAtPixel(pixel, function (feature) {
      return filterFeature(feature);
    });

    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    featureHover(pixel);
  });
}

/*
 * Clone buttons:
 * <https://api.jquery.com/clone/>
 * <https://api.jquery.com/category/miscellaneous/dom-element-methods/>
 */
