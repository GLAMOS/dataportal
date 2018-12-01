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

import controller from '../controller'
import urlManager from '../UrlManager'
import { highlightedGlacier } from '../datastore'   // the one feature (glacier) which is selected
import { selectedGlaciers } from '../datastore'   // list of features (glaciers) for comparison


const DISPLAY_NAME = 'glacier_short_name';

var hidePoints = new Style({
  image: new Circle(({
    radius: 0,
    fill: new Fill({
      color: 'black'
    })
  }))
});

var noDataGlacierStyle = new Style({
  image: new Circle(({
    radius: 2,
    fill: new Fill({
      color: 'black'
    })
  }))
});

var selectableStyleSmall = new Style({
  image: new Circle(({
    radius: 5,
    fill: new Fill({
      color: 'black',
      stroke: '#380303',
      zIndex: 50
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

var defaultGlacierStyle = new Style({
  image: new Circle(({
    radius: 5,
    fill: new Fill({
      color: 'red',
    })
  }))
});

var hoverStyle = new Style({
  image: new Icon(({
    src: '/theme/img/pin-hover.svg',
    scale: 0.7,
    zIndex: 100
  }))
});

var selectableStyle = new Style({
  image: new Icon(({
    src: '/theme/img/pin-default.svg',
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

var style = {}
style[0] = noDataGlacierStyle;
style[1] = defaultGlacierStyle;
style[2] = selectableStyle;
style[3] = selectableStyleSmall;
style[4] = hidePoints;


function filterFeature(feature) {
  //keine Werte
  var has_mass_value = feature.get('has_mass_value');
  var has_length_value = feature.get('has_length_value');
  if (has_mass_value == 't' || has_length_value == 't') {
    return true;
  }
  else return false;
}

function switchStyle(feature, resolution) { //console.log(resolution);

  if (filterFeature(feature)) {
    if (resolution > 100) {
      return [style[3]];
    }
    else {
      return [style[2]];
    }
  }
  else {
    return [style[0]]; //keine Werte - noDataGlacierStyle:
  }
};

var unit = function (x) {
  if (x >= -999 && x <= 999)
    return x + ' m';
  else
    return Math.round(x / 100) / 10 + ' km';
};

function fillSchluesseldaten (featureId, page){
console.log('fillSchlüsseldaten: ' + page);
  var infoboxGlacierName = document.getElementsByClassName("infobox-glaciername");
  var infoboxLengthCumulative = document.getElementsByClassName("infobox-length--cumulative");
  var infoboxMassCumulative = document.getElementsByClassName("infobox-mass--cumulative");
  var infoboxLengthTimespan = document.getElementsByClassName("infobox-length--timespan");
  var infoboxMassTimespan = document.getElementsByClassName("infobox-mass--timespan");
  var infoboxLengthDuration = document.getElementsByClassName("infobox-length--duration");
  var infoboxMassDuration = document.getElementsByClassName("infobox-mass--duration");

  function updateValue(el, value) {
    for( var i = 0; i < el.length; i++) {
      el[i].innerHTML = value;
    }
  }

  console.log(infoboxGlacierName);
    if (gletscher_source.getFeatureById(featureId).get('has_mass_value') == 't') {
      updateValue(infoboxMassTimespan, gletscher_source.getFeatureById(featureId).get('date_from_mass').toFixed(0) + ' &ndash; ' + gletscher_source.getFeatureById(featureId).get('date_to_mass').toFixed(0) );
      updateValue(infoboxMassDuration, gletscher_source.getFeatureById(featureId).get('mass_anzahl_jahre').toFixed(0) + ' Jahre' );
      updateValue(infoboxMassCumulative, unit(gletscher_source.getFeatureById(featureId).get('last_mass_change_cumulative')) + '&sup3;' );
    }
    else {
      updateValue(infoboxMassTimespan, '--');
      updateValue(infoboxMassDuration, '--');
      updateValue(infoboxMassCumulative, '--');
    }

    if (gletscher_source.getFeatureById(featureId).get('has_length_value') == 't') {
      updateValue(infoboxLengthTimespan, gletscher_source.getFeatureById(featureId).get('date_from_length').toFixed(0) + ' &ndash; ' + gletscher_source.getFeatureById(featureId).get('date_to_length').toFixed(0) );
      updateValue(infoboxLengthDuration, gletscher_source.getFeatureById(featureId).get('length_anzahl_jahre').toFixed(0) + ' Jahre' );
      updateValue(infoboxLengthCumulative, unit(gletscher_source.getFeatureById(featureId).get('last_length_change_cumulative')) );
    }
    else {
      updateValue(infoboxLengthTimespan, '--');
      updateValue(infoboxLengthDuration, '--');
      updateValue(infoboxLengthCumulative, '--');
    }
    updateValue(infoboxGlacierName, gletscher_source.getFeatureById(featureId).get(DISPLAY_NAME) );

  if (page == 'factsheet') {
    updateValue(infoboxGlacierName, gletscher_source.getFeatureById(featureId).get(DISPLAY_NAME) );
  }

};
/*
function remove_first_occurrence(str, searchstr)       {
	var index = str.indexOf(searchstr);
	if (index === -1) {
		return str;
	}
	return str.slice(0, index) + str.slice(index + searchstr.length);
}

*/

// ----- Monitoring: Selection List
class SelectionList {
  constructor(datastoreList) {
    this.store = datastoreList
    this.svgClose = '<svg id="Ebene_1" data-name="Ebene 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>close</title><path d="M305.5,256,473.75,87.75a35,35,0,0,0-49.5-49.5L256,206.5,87.75,38.25a35,35,0,0,0-49.5,49.5L206.5,256,38.25,424.25a35,35,0,0,0,49.5,49.5L256,305.5,424.25,473.75a35,35,0,0,0,49.5-49.5Z"></path></svg>'

    this.add = this.add.bind(this)
    this.renderEntry = this.renderEntry.bind(this)
  }

  add(feature) {
    this.store.add(feature)
    this.refresh()
  }

  select(id) {
    id = id.replace( '--list', '')
    controller.selectionListHighlight(id)
    this.refresh()
  }

  remove(id) {
    id = id.replace( '--close', '')
    controller.selectionListRemove(id)
    this.refresh()
  }

  //TODO: implement Reset via button

  refresh() {
    const contents = this.store.get().map( this.renderEntry )
    const container = $('#monitoring-glacier--list')
    $('#monitoring-glacier--list').html(contents)
    .find('[name="highlight"]').on('click', (ev) => this.select(ev.target.id) ).end()
    .find('[name="remove"]').on('click', (ev) => this.remove(ev.target.id) ).end()
  }

  renderEntry(feature) {
    const auxClass = (feature == highlightedGlacier.feature) ? 'active' : ''
    const id = feature.getId()
    const name = feature.get(DISPLAY_NAME)
    return `<div class="comparisonEntry ${auxClass}">
        <button type="button" name="highlight" class="glacierName" id="${id}--list">${name}</button>
        <button type="button" name="remove" class="btn close" id="${id}--close">
          ${this.svgClose}
        </button>
      </div>`
  }
}

var monitoringSelectedFeatureList = new SelectionList(selectedGlaciers);
controller.bridge({monitoringSelectedFeatureList})

// -----

function dynamicLinks() {
  $('a.keephash').on("click", function (e) {
     urlManager.navigateTo( this.href);
     e.preventDefault();
  })
}
/*
//ist im moment statische datei - sollte vom glamosserver kommen
var gletscher_alle = new VectorLayer({
  source: new Vector({
    format: new GeoJSON(),
    url: '/geo/glamos_inventory_dummy.geojson'
  }),
  map: map,
  style: switchStyle //style different depending on data availibility
});

*/


/*  Search Bar
 *
 * Used on the tabs Home, Monitoring and Factsheet
 * This function bootstratps the search bar:
 * - sets up the underlaying data
 * - attaches autocomplete to the template's input
 * - handles the select event (choosing a hit)
 */
function enableSearch( gletscher_features) {
      const searchInput = $('.fieldSearchWrapper input');

      gletscher_features = gletscher_features.filter(filterFeature);
      if( ! searchInput.length || ! gletscher_features.length)  return;

      const searchData = gletscher_features.map( feat => (
        { label: feat.get(DISPLAY_NAME), value: feat }
      ));

      function onSelect(ev, ui) {
        const feature = ui.item.value;
        controller.searchSelected(feature)
        // emptify search bar
        ev.preventDefault();   // otherwise ui.item.value shows up in input
        $(ev.target).val("");
      }
      searchInput.autocomplete({
          source: searchData,
          select: onSelect,
      });
}
controller.bridge({enableSearch})


//liste mit VIP gletschern - noch unklar wo diese später herkommt
var glacierVips = glacier_vip.features.map(function (el) {
  return el.properties;
});

var format = new GeoJSON;
var url = '/geo/glamos_inventory_dummy.geojson';
var gletscher_id;// = 'B36\/26'; //default = Aletschgletscher
var initialFeature;

//es wird ein Gletscher gelesen aus einer liste von 12 definierten VIPs
//todo: aus geoJSON ermitteln wieviele Gletscher die Liste enthaelt
function getRandomVIP() {
  var min = 1;
  var max = 12;
  var randomNumber = Math.floor((Math.random() * (max - min)) + min);
  return glacierVips[randomNumber].pk_sgi;
}

var gletscher_source = new Vector({
  strategy: bbox,
  loader: function (extent, resolution, projection) {
    $.ajax(url).then(function (response) {
      var features = format.readFeatures(response,
        { featureProjection: 'EPSG:3857' });
      gletscher_source.addFeatures(features);

      // re-use features ary for search bar
      controller.gotFeatures(features)

      const highlighted  = highlightedGlacier.get()
      const gletscher_id = highlighted ? highlighted.getId() : getRandomVIP()

      dynamicLinks();

      fillSchluesseldaten(gletscher_id, page);

      var coordX = gletscher_source.getFeatureById(gletscher_id).get('coordx');
      var coordY = gletscher_source.getFeatureById(gletscher_id).get('coordy');

      var extent_frompoint = [coordX, coordY, coordX, coordY];
      map.getView().fit(extent_frompoint, { size: map.getSize(), maxZoom: 11 });

     initialFeature = new Feature({
        geometry: new Point([coordX, coordY]),
        style: activeStyle
      });
      initialFeature.setId('initialGlacier');
      selectedOverlay.getSource().addFeature(initialFeature);
      highlightedGlacier.feature = initialFeature;
    });

  }
});


var gletscher_alle = new VectorLayer({
  name: 'Gletscher Inventar',
  source: gletscher_source,
  map: map,
  style: switchStyle //style different depending on data availibility
});
gletscher_alle.set('name', 'gletscher_alle');
gletscher_source.set('id','pk_sgi');


var selectedOverlay = new VectorLayer({
  source: new Vector(),
  map: map,
  style: activeStyle
});


// define 3 Map instances each for one tab:
let page = null;
let map = null;
if (document.getElementById('factsheet-map')) {

  //only one map-layer, static map with glacier in center (dynamically set)
  map = new Map({
    target: 'factsheet-map',
    extent: [650000, 4000000, 1200000, 6500000],
    layers: [eiszeit],
    interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow
    controls: [],//remove zoom for factsheetwindow
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
  //only one map-layer - no layerswitcher
  map = new Map({
    target: 'home-map',
    layers: [pixel_500px, pixel_1000px, eiszeit],
    //interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow
    //controls: [],//remove zoom for factsheetwindow
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

map && map.addLayer(selectedOverlay);


/****************************************************************************************************************
 * ** add interactivity to the map
 ****************************************************************************************************************/

// get all features under the mouse
function mouse2features(browserEvent) {
  const coordinate = browserEvent.coordinate;
  const pixel = map.getPixelFromCoordinate(coordinate);
  const features = [];
  map.forEachFeatureAtPixel(pixel, (feature, layer) => features.push(feature) );
  return features;
}

// populate Schluesseldaten, highlight selected marker
function selectGlacier(feature, pan=true) {
    //1. fill infobox from feature
    gletscher_id = feature.getId();
    fillSchluesseldaten(gletscher_id, page);

    //2a. reset current selection
    if (highlightedGlacier.feature) {
     try {
      selectedOverlay.getSource().removeFeature( highlightedGlacier.feature);
     } catch (e) {
      console.debug('seems highlightedGlacier was not found on selectedOverlay');
     }
    }

    //2. fuege roten Marker (selektierter Gletscher) als Overlay hinzu
    //hoverOverlay.getSource().removeFeature(hover);
    selectedOverlay.getSource().addFeature(feature);
    highlightedGlacier.feature = feature;

    // possibly pan the map to the highlighted marker
    if(pan) {
      const center = [ highlightedGlacier.feature.get('coordx'), highlightedGlacier.feature.get('coordy') ];
      map.getView().setCenter(center);
    }

    //TODO: if monitoring, change/update also chart (add glacier and/or highlighted this one)

    //3. fuege neuen slug hinzu, triggert neuladen
}

// when the user clicks on a feature, select it
// (last one in DOM if cursor hit multiple features)
function onMapClick(browserEvent) {
  let features = mouse2features(browserEvent);
  // consider only glaciers with data
  features = features.filter(filterFeature);
  if( !features.length)  return;

  //manche Gletscherpunkte sind so dicht zusammen dass mehr als einer gelesen wird
  //es wird nur das letzte feature beachtet
  controller.mapMarkerHighlighted( features[features.length-1] )
}
controller.bridge({selectGlacier})

map && map.on('click', onMapClick);


//add hoverstyle
var hoverOverlay = new VectorLayer({
  source: new Vector(),
  map: map,
  style: function (feature, resolution) {
    if (resolution > 100) {
      return hoverStyleSmall;
    } else {
      return hoverStyle;
    };
  }
});

var hover;
var featureHover = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {

    var has_mass_value = feature.get('has_mass_value');
    var has_length_value = feature.get('has_length_value');

    //click funktioniert nur auf wenn Gletscher werte hat
    if (has_mass_value == 't' || has_length_value == 't') {
      return feature;
    };
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


//add pointerhand
map && map.on('pointermove', function (e) {
  if (e.dragging) return;
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.forEachFeatureAtPixel(pixel, function (feature) {
    return filterFeature(feature);
  });

  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  featureHover(pixel);
});


// -----
controller.onPageLoad()


//Buttons clonen:
//https://api.jquery.com/clone/
//https://api.jquery.com/category/miscellaneous/dom-element-methods/
