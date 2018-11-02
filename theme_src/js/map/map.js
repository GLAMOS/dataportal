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
  var infoboxGlacierName = document.getElementById("infobox-glaciername");
  var infoboxLengthCumulative = document.getElementById("infobox-length--cumulative");
  var infoboxMassCumulative = document.getElementById("infobox-mass--cumulative");
  var infoboxLengthTimespan = document.getElementById("infobox-length--timespan");
  var infoboxMassTimespan = document.getElementById("infobox-mass--timespan");
  var infoboxLengthDuration = document.getElementById("infobox-length--duration");
  var infoboxMassDuration = document.getElementById("infobox-mass--duration");

  console.log(infoboxGlacierName);
    if (gletscher_source.getFeatureById(featureId).get('has_mass_value') == 't') {
      infoboxMassTimespan.innerHTML = gletscher_source.getFeatureById(featureId).get('date_from_mass').toFixed(0) + ' &ndash; ' + gletscher_source.getFeatureById(featureId).get('date_to_mass').toFixed(0);
      infoboxMassDuration.innerHTML = gletscher_source.getFeatureById(featureId).get('mass_anzahl_jahre').toFixed(0) + ' Jahre';
      infoboxMassCumulative.innerHTML = unit(gletscher_source.getFeatureById(featureId).get('last_mass_change_cumulative')) + '&sup3;';
    }
    else {
      infoboxMassTimespan.innerHTML = '--';
      infoboxMassDuration.innerHTML = '--';
      infoboxMassCumulative.innerHTML = '--';
    }

    if (gletscher_source.getFeatureById(featureId).get('has_length_value') == 't') {
      infoboxLengthTimespan.innerHTML = gletscher_source.getFeatureById(featureId).get('date_from_length').toFixed(0) + ' &ndash; ' + gletscher_source.getFeatureById(featureId).get('date_to_length').toFixed(0);
      infoboxLengthDuration.innerHTML = gletscher_source.getFeatureById(featureId).get('length_anzahl_jahre').toFixed(0) + ' Jahre';
      infoboxLengthCumulative.innerHTML = unit(gletscher_source.getFeatureById(featureId).get('last_length_change_cumulative'));
    }
    else {
      infoboxLengthTimespan.innerHTML = '--';
      infoboxLengthDuration.innerHTML = '--';
      infoboxLengthCumulative.innerHTML = '--';
    }
    infoboxGlacierName.innerHTML = gletscher_source.getFeatureById(featureId).get('glacier_short_name');

  if (page == 'factsheet') {
    infoboxGlacierName.innerHTML = gletscher_source.getFeatureById(featureId).get('glacier_short_name') + ' &ndash; Factsheet';
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

function dynamicLinks() {
  let dynamicElements = document.querySelectorAll(`#navbar-mapViewer, #navbar-factsheetListing,
    #navbar-homepage, #oversight-mapViewer, #oversight-factsheet, #oversight-download,
    #infobox-glaciername--link`);
 
  for (var i = 0; i < dynamicElements.length; i++){

   dynamicElements[i].addEventListener("click", function (e) {
    window.location.href = this.href + window.location.hash;
     e.preventDefault();
   }, false);
 
 }
};
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

//liste mit VIP gletschern - noch unklar wo diese später herkommt
var glacierVips = glacier_vip.features.map(function (el) {
  return el.properties;
});

var format = new GeoJSON;
var url = '/geo/glamos_inventory_dummy.geojson';
var gletscher_id;// = 'B36\/26'; //default = Aletschgletscher
var initialFeature;
var selected;

let id_from_slug;

var gletscher_source = new Vector({
  strategy: bbox,
  loader: function (extent, resolution, projection) {
    $.ajax(url).then(function (response) {
      var features = format.readFeatures(response,
        { featureProjection: 'EPSG:3857' });
      gletscher_source.addFeatures(features);
            
      // var id_from_slug = gletscher_source.getFeatureById(slug);
      //console.log("window.location.hash = '" + window.location.hash + "'");
      id_from_slug = decodeURIComponent((window.location.hash.match(/^#?(.+)/) || [, ""])[1]);
        
      /* DEBUG */
      console.log("id_from_slug =", id_from_slug);
      dynamicLinks();

      /* Falls es einen slug gibt und der Gletscher im Datenset gefunden wird */
      if (id_from_slug
          && gletscher_source.getFeatureById(id_from_slug)) { 
        // console.log(gletscher_source.getFeatureById(id_from_slug).getGeometry().getCoordinates()); //evt mit getCoordinate aber dann noch x und y seperieren
        gletscher_id = id_from_slug;
        console.log('Slug gletscher: ' + id_from_slug);
        fillSchluesseldaten(id_from_slug, page);
        window.location.hash = id_from_slug;

        //add Eventlistener auf alle Links

        var coordX = gletscher_source.getFeatureById(id_from_slug).get('coordx');
        var coordY = gletscher_source.getFeatureById(id_from_slug).get('coordy');
      }
      else {

        //when the site loads the first time:
        //es wird ein Gletscher gelesen aus einer liste von 12 definierten VIPs
        //todo: aus geoJSON ermitteln wieviele Gletscher die Liste enthaelt
        var min = 1;
        var max = 12;
        var randomNumber = Math.floor((Math.random() * (max - min)) + min);
        var id_from_vips = glacierVips[randomNumber].pk_sgi;
        
        gletscher_id = id_from_vips;
        console.log('random gletscher: ' + id_from_vips);
        fillSchluesseldaten(id_from_vips, page);
        window.location.hash = id_from_vips;
        
        
        var coordX = gletscher_source.getFeatureById(id_from_vips).get('coordx');
        var coordY = gletscher_source.getFeatureById(id_from_vips).get('coordy');
      };

      var extent_frompoint = [coordX, coordY, coordX, coordY];
      map.getView().fit(extent_frompoint, { size: map.getSize(), maxZoom: 11 });

     initialFeature = new Feature({
        geometry: new Point([coordX, coordY]),
        style: activeStyle
      });
      initialFeature.setId('initialGlacier');
      selectedOverlay.getSource().addFeature(initialFeature);
      selected = initialFeature;
    });

  }
});


var gletscher_alle = new VectorLayer({
  name: 'Gletscher Inventar',
  preview: "http://www.culture.gouv.fr/Wave/image/memoire/2445/sap40_z0004141_v.jpg",
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
} else
  page = 'other';

  map.addLayer(selectedOverlay);
  


/****************************************************************************************************************
 * ** add interactivity to the map
 ****************************************************************************************************************/

// when the user clicks on a feature, get the name property
// from each feature under the mouse and display it
function onMapClick(browserEvent) {
  var coordinate = browserEvent.coordinate;
  var pixel = map.getPixelFromCoordinate(coordinate);

  //1. fill infobox from feature    
  //manche Gletscherpunkte sind so dicht zusammen dass mehr als einer gelesen wird
  //es wird nur das letzte feature gelesen und geschrieben da es ueberschrieben wird in der foreach-schleife
  let lastFeature = null;
  map.forEachFeatureAtPixel(pixel, function (feature) {
    //click nur wenn es werte oder namen hat
    if (filterFeature(feature)) {
      gletscher_id = feature.getId();
      fillSchluesseldaten(feature.getId(), page);      
      //TODO wenn null = leer
      lastFeature = feature;
    }

    //2. fuege roten Marker (selektierter Gletscher) als Overlay hinzu
    if (feature !== selected && filterFeature(feature)) {
      if (selected) {
        selectedOverlay.getSource().removeFeature(selected);
      }
      if (feature) {
        //hoverOverlay.getSource().removeFeature(hover);
        selectedOverlay.getSource().addFeature(feature);
      }
      selected = feature;
    }


  

  });


  //3. fuege neuen slug hinzu:
  if (lastFeature) {
    window.location.hash =
    //  encodeURIComponent(
        gletscher_id
    //  )
    ;

    //4. Add Eventlistener auf alle Links:
  
  //alert(document.getElementById("navbar-mapViewer"));

//  document.getElementById("navbar-mapViewer").setAttribute("title", lastFeature.get('glacier_short_name'));


  

  }


};

map.on('click', onMapClick);


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


//add pointerhand
map.on('pointermove', function (e) {
  if (e.dragging) return;
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.forEachFeatureAtPixel(pixel, function (feature) {
    return filterFeature(feature);
  });

  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  featureHover(pixel);
});




//Buttons clonen:
//https://api.jquery.com/clone/
//https://api.jquery.com/category/miscellaneous/dom-element-methods/


