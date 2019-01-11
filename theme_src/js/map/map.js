
import $ from 'jquery';
//window.$ = window.jQuery = $;
import 'jquery-ui/ui/widgets/autocomplete';

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
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import Group from 'ol/layer/Group';

import { swissimage_wmts, swissalti3d_wmts, eiszeit_wmts, dufour_wmts, siegfried_wmts, pixelkarte_farbe_wmts, pixelkarte_grau_wmts } from './layer/swisstopo_layer';
import { glamos_sgi_1850, glamos_sgi_1973, glamos_sgi_2010, glacier_outlines } from './layer/glamos_layer';

import controller from '../controller'
import urlManager from '../UrlManager'
import datastore from '../datastore';
import { highlightedGlacier } from '../datastore'   // the one feature (glacier) which is selected
import { selectedGlaciers } from '../datastore'   // list of features (glaciers) for comparison

const DISPLAY_NAME = 'glacier_short_name';

	// A group layer for base layers
var baseLayers = new Group(
  {
    title: 'Hintergrundkarten',
    openInLayerSwitcher: true,
    layers: [ dufour_wmts,
              siegfried_wmts,
              eiszeit_wmts, swissimage_wmts, swissalti3d_wmts,  pixelkarte_grau_wmts, pixelkarte_farbe_wmts]
  });

  var layer = baseLayers.getLayers().getArray();
for (var i = 0; i < layer.length; i++) {
  layer[i].setVisible(false);
}

var glamosSgi = new Group(
  {
    title: 'Gletscherausdehnung',
    openInLayerSwitcher: false,
    layers: [glamos_sgi_1850, glamos_sgi_1973, glamos_sgi_2010]
  });

var hidePoints = new Style({
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

var selectableStyleSmall_hasmass = new Style({
  image: new Circle(({
    radius: 5,
    fill: new Fill({
      color: '#2b7bb9',
      stroke: '#2b7bb9',
      zIndex: 0
    })
  }))
});

var hoverStyleSmall = new Style({
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

var selectableStyle_hassmass = new Style({
  image: new Icon(({
    src: '/theme/img/pin-masse.svg',
    scale: 0.7
  }))
});

var activeStyle = new Style({
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
style[5] = selectableStyleSmall_hasmass;
style[6] = selectableStyle_hassmass;

function filterFeature(feature) {
  return feature.get('has_mass') || feature.get('has_length');
}

function checkResolution_masse(feature, resolution) {
  if (resolution > 100) {  
      return [style[5]];
  }
  else {
      return [style[6]];
  }    
};

function checkResolution_laenge(feature, resolution) {
  if (resolution > 100) {  
    return [style[3]];
}
else {
    return [style[2]];
}  
};

var switcher = new LayerSwitcher(
  {	target:$(".layerSwitcher").get(0), 
    reordering: false
    //oninfo: function (l) { alert(l.get("title")); }
  });

const nbsp = " ";

const format_meters = function(m) {
  if (m >= -999 && m <= 999)
    return m + nbsp + 'm';
  else
    return (m / 1000).toFixed(1) + nbsp + 'km';
};

const format_meters3 = function(m) {
  return m + nbsp + 'm³';
};

const format_years = function(y) {
  return y.toFixed(0) + nbsp + 'Jahre';
};

const format_span = function(values) {
  const sep_with_thinspace = " – ";
  return values.map((y) => y.toFixed(0)).join(sep_with_thinspace);
}

const format_plain = function(text) {
  return text;
}

class InfoboxField {
  constructor(selector, format) {
    this.selector = '.' + selector;
    this.format = format;
  }
  
  clear() {
    const em_dash = "—";
    $(this.selector).text(em_dash);
  }

  update(value) {
    $(this.selector).text(this.format(value));
  }
}


function fillSchluesseldaten(feature) {
  const glacierName = new InfoboxField('infobox-glaciername', format_plain);
  glacierName.update(feature.get(DISPLAY_NAME));

  const massCumulative = new InfoboxField('infobox-mass--cumulative', format_meters3);
  const massTimespan = new InfoboxField('infobox-mass--timespan', format_span);
  const massDuration = new InfoboxField('infobox-mass--duration', format_years);
  if (feature.get('has_mass')) {
    const first = feature.get('first_year_mass');
    const last = feature.get('last_year_mass');
    massTimespan.update([first, last]);
    massDuration.update(last - first);
    massCumulative.update(feature.get('last_mass_change_cumulative'));
  } else {
    massTimespan.clear()
    massDuration.clear()
    massCumulative.clear()
  }

  const lengthCumulative = new InfoboxField('infobox-length--cumulative', format_meters);
  const lengthTimespan = new InfoboxField('infobox-length--timespan', format_span);
  const lengthDuration = new InfoboxField('infobox-length--duration', format_years);
  if (feature.get('has_length')) {
    const first = feature.get('first_year_length');
    const last = feature.get('last_year_length');
    lengthTimespan.update([first, last]);
    lengthDuration.update(last - first);
    lengthCumulative.update(feature.get('last_length_change_cumulative'));
  }
  else {
    lengthTimespan.clear()
    lengthDuration.clear()
    lengthCumulative.clear()
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
    this.listMaxEntries = 5;

    this.add = this.add.bind(this);
    this.reset = this.reset.bind(this);
    this.renderEntry = this.renderEntry.bind(this);

    /* Hook up reset callback only once (thus done in contructor) */
    $('#monitoring-glacier--list + button[name="reset"]').on('click', this.reset);
  }

  maxEntriesReached () {
    return this.store.get().length >= this.listMaxEntries;
  }

  add (feature) {
    if (this.maxEntriesReached()) {
      return this.denyAddition(feature);
    }
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
    $('#monitoring-glacier--list').html(contents)
      .find('[name="highlight"]').on('click', (ev) => this.select(ev.currentTarget.id))
      .end()
      .find('[name="remove"]')
      .on('click', (ev) => this.remove(ev.currentTarget.id))
      .end();
    $('#selectionlist-max-warn').toggleClass('hidden', !this.maxEntriesReached());
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

  denyAddition () {
    const el = $('#selectionlist-max-warn').addClass('toast');
    setTimeout(() => el.removeClass('toast'), 1000);
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
controller.bridge({dynamicLinks})


/*  Search Bar
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


const format = new GeoJSON;
const url = '/geo/inventory/web_glacier_base_data.geojson';

// depends: url, format
function loadFeatures(extent, resolution, projection) {
    $.ajax(url).then(function (response) {

      var features = format.readFeatures(response,
        { featureProjection: 'EPSG:3857' });
 
        // store features in 3 different vectorsources to filter in layerswitcher
        for(var i = 0; i < features.length; i++){ 
          const feature = features[i];
          let got_data = false;
          if (feature.get("has_mass")) {
            gletscher_source_hasmass.addFeature(feature);
            got_data = true;
          }

          if (feature.get("has_length")) {
            gletscher_source_haslength.addFeature(feature);
            got_data = true;
          }

          if (!got_data) {
            gletscher_source_nodata.addFeature(feature);
          }
        };
        
      // store features in datastorage and do stuff now we know about them
      controller.gotFeatures(features)
    });
}

var gletscher_source_nodata = new Vector({
  strategy: bbox,
  loader: loadFeatures,   //gletscher inventar datei wird hier aufgerufen und in den datastore geladen
  id: 'pk_sgi'
});

// gletscher_source_haslength und gletscher_source_hasmass: wird asynchron im loadFeatures() gefiltert und gefuellt
var gletscher_source_haslength = new Vector({
  strategy: bbox,
  id: 'pk_sgi'
});


var gletscher_source_hasmass = new Vector({
  strategy: bbox,
  id: 'pk_sgi'
});

var gletscher_nodata = new VectorLayer({
  allwaysOnTop: true,
  title: 'ohne Messwerte',   // used as display name for layerswitcher
  source: gletscher_source_nodata,
  map: map,
  style: style[0] //style different depending on data availibility
});

var gletscher_masse = new VectorLayer({
  title: 'Masse-Messungen',   // used as display name for layerswitcher
  source: gletscher_source_hasmass,
  map: map,
  style: checkResolution_masse //style different depending on data availibility
});

var gletscher_length = new VectorLayer({
  allwaysOnTop: true,
  title: 'Länge-Messungen' ,   // used as display name for layerswitcher
  source: gletscher_source_haslength,
  map: map,
  style: checkResolution_laenge //style different depending on data availibility
});

var GletscherLayers = new Group(
  {
    title: 'Gletscher',
    openInLayerSwitcher: true,
    layers: [ gletscher_nodata, gletscher_length, gletscher_masse ]
  });

var selectedOverlay = new VectorLayer({
  source: new Vector(),
  map: map,
  style: activeStyle,
  displayInLayerSwitcher: false
});

/* 3 Map instances, one for each tab */
let page = null;
let map = null;

const mapDefaults = {
  resolutions: [500,229.31, 100, 57.327, 28.663, 14.331, 7.165, 3.582, 1.791, 0.8955],
  extent: [650000, 4000000, 1200000, 6500000],
  center: [903280, 5913450]
}

if (document.getElementById('factsheet-map')) {
  /* Only one map layer, static map centered on glacier (dynamically set) */
  map = new Map({
    target: 'factsheet-map',
    extent: [650000, 4000000, 1200000, 6500000],
    layers: [pixelkarte_grau_wmts, gletscher_nodata],
    interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow
    controls: [],//remove zoom for factsheetwindow
    view: new View({
      extent: mapDefaults.extent,
      center: mapDefaults.center,
      resolutions: mapDefaults.resolutions,
      resolution: 28.663,
    })
  });

  page = 'factsheet';
  pixelkarte_grau_wmts.set('visible', true);
  gletscher_nodata.setStyle(hidePoints);

} else if (document.getElementById('monitoring-map')) {
  map = new Map({
    target: 'monitoring-map',
    layers: [baseLayers, glamosSgi, GletscherLayers ],
    view: new View({
      extent: mapDefaults.extent,
      center: mapDefaults.center,
      resolutions: mapDefaults.resolutions,
      resolution: 57.327,
    })
  });

  page = 'monitoring';
  pixelkarte_farbe_wmts.set('visible', true);
  map.addControl(switcher);

} else if (document.getElementById('home-map')) {
  /* Only one map layer → no layer switcher */
  map = new Map({
    target: 'home-map',
    layers: [eiszeit_wmts,  GletscherLayers],
    view: new View({
      extent: mapDefaults.extent,
      center: mapDefaults.center,
      resolutions: mapDefaults.resolutions,
      resolution: 100,
    })
  });

  page = 'home';
  eiszeit_wmts.set('visible', true);
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
 * @depends page; highlightedGlacier, selectedOverlay, fillSchluesseldaten
 */
function selectGlacier (feature) {
  if (!feature) return;

  /* 0. Store the feature as the highlighted one */
  highlightedGlacier.feature = feature;

  /* 1. Fill infobox from feature */
  fillSchluesseldaten(feature);

  /* 2a. Reset current selection */
  selectedOverlay.getSource().clear();

  /* 2. fuege roten Marker (selektierter Gletscher) als Overlay hinzu */
  selectedOverlay.getSource().addFeature(feature);
}

/*
 * Select feature when the user clicks it
 *
 * (last one in DOM if pointer is above multiple features)
 */
function onMapClick (browserEvent) {
  let features = mouse2features(browserEvent);

  /* consider only glaciers with data */
  features = features.filter(filterFeature);
  if (!features.length) return;

  /*
   * Manche Gletscherpunkte sind so dicht zusammen, dass mehr als einer gelesen wird;
   * es wird nur das letzte Feature beachtet
   */
  controller.mapMarkerHighlighted(features[features.length - 1]);
}
controller.bridge({selectGlacier});

if (map) map.on('click', onMapClick);


/* Add hover style */
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

  if (feature !== hover && feature !== highlightedGlacier.feature) {
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
