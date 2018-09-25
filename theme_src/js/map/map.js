import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import Image from 'ol/layer/Image';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import GeoJSON from 'ol/format/GeoJSON'; 
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import VectorSource from 'ol/source/Vector';
import Circle from 'ol/style/Circle';
import {Icon, Style,Stroke,Fill} from 'ol/style';
import {defaults as Interactions} from 'ol/interaction';
import {defaults as Control} from 'ol/control';
import glacier_vip from './layer/glacier_vip';
import {pixel_500px,pixel_1000px,eiszeit} from './layer/swisstopo_layer';
import {glamos_sgi_1850,glamos_sgi_1973,glamos_sgi_2010} from './layer/glamos_layer';




/* var hoverStyle = new Style({
  image: new Icon(({
    //anchor: [0.5, 0.5],
    src: '/theme/img/pin-simple-active.svg',
    scale: 0.8
  }))
}); */

var noDataGlacierStyle = new Style({
  image: new Circle(({
    radius: 2,
    fill: new Fill({
        color: 'black'
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
  image: new Circle(({
    radius: 5,
    fill: new Fill({
        color: 'red',
    })
}))
});

var selectStyle = new Style({
  image: new Icon(({
    //anchor: [0.5, 0.5],
    src: '/theme/img/pin-simple.svg',
    scale: 0.8
  }))
});


var style = {}
style[0] = noDataGlacierStyle;
style[1] = defaultGlacierStyle;
style[2] = selectStyle;

function switchStyle(feature, resolution) { 
  var has_mass_value = feature.get('has_mass_value');
  var has_length_value = feature.get('has_length_value');

  if (has_mass_value == 't' || has_length_value == 't') {
    return [style[2]];
  }
  //keine Werte - noDataGlacierStyle:
  else {
    return [style[0]];
  }

};

  //ist im moment statische datei - sollte vom glamosserver kommen
  var gletscher_alle = new VectorLayer({
    source: new Vector({
        format: new GeoJSON(),
        url: '/geo/glamos_inventory_dummy.geojson'
    }),
    style: switchStyle 
  });


// define 3 Map instances each for one tab: 
var page = null;
var map = null;
if (document.getElementById('factsheet-map')) {

  //only one map-layer, static map with glacier in center (dynamically set)
  var map = new Map({
    target: 'factsheet-map',
    layers: [eiszeit],
    interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow 
    controls: [],//remove zoom for factsheetwindow
    view: new View({
      center: [903280,5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 14
    })
  });

  page = 'factsheet';

} else if (document.getElementById('monitoring-map')) {
  
  var map = new Map({
    target: 'monitoring-map',
    //layers: [pixel_500px,pixel_1000px,eiszeit,glamos_sgi_1850,glamos_sgi_1973,glamos_sgi_2010,gletscher_alle],
    layers: [pixel_500px,pixel_1000px,eiszeit,gletscher_alle],
    view: new View({
      center: [903280,5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 14
    })
  });

  page = 'monitoring';

} else if (document.getElementById('home-map')) {
    //only one map-layer - no layerswitcher
    var map = new Map({
      target: 'home-map',
      layers: [pixel_500px,pixel_1000px,eiszeit,glamos_sgi_1850,glamos_sgi_1973,glamos_sgi_2010,gletscher_alle],
      //interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow 
      //controls: [],//remove zoom for factsheetwindow
      view: new View({
        center: [903280,5913450],
        zoom: 10,
        minZoom: 8,
        maxZoom: 14
      })
    });

  page = 'home';

} else 
  page = 'other';



 



//when the site loads the first time:
//es wird ein Gletscher gelesen aus einer liste von 20 definierten VIPs
//todo: aus geoJSON ermitteln wieviele Gletscher die Liste enthaelt
var min = 1;
var max = 12;
var glacierId =  Math.floor((Math.random() * (max - min)) + min);

//push all features into variable
var glacierVips = glacier_vip.features.map(function(el)
{
    return el.properties;
})

var randomX = glacierVips[glacierId].coordx;
var randomY = glacierVips[glacierId].coordy;
var extent_frompoint = [randomX, randomY, randomX, randomY];

//Frage: Besser: Ausdehnung berechnen(dafür könnte man polygone aus datenbank verwenden) 
//zur vereinfachung: maxZoom festgelegt und nur Punkte eingelesen
map.getView().fit(extent_frompoint, {size:map.getSize(), maxZoom:12});

//fill infobox from file
var unit = function(x) {
  if (x >= -999 && x <= 999) 
    return x + ' m';
  else 
    return Math.round(x / 100) / 10 + ' km';
  };

var infoboxGlacierName = document.getElementById("infobox-glaciername");
var infoboxLengthCumulative = document.getElementById("infobox-length--cumulative");
var infoboxMassCumulative = document.getElementById("infobox-mass--cumulative");
var infoboxLengthTimespan = document.getElementById("infobox-length--timespan");
var infoboxLengthDuration = document.getElementById("infobox-length--duration");
var infoboxMassTimespan = document.getElementById("infobox-mass--timespan");
var infoboxMassDuration = document.getElementById("infobox-mass--duration");

infoboxGlacierName.innerHTML = glacierVips[glacierId].glacier_short_name; 
infoboxLengthTimespan.innerHTML = glacierVips[glacierId].date_from_length.toFixed(0) + ' &ndash; ' + glacierVips[glacierId].date_to_length.toFixed(0);     
infoboxLengthDuration.innerHTML = glacierVips[glacierId].length_anzahl_jahre.toFixed(0) + ' Jahre';
infoboxMassTimespan.innerHTML = glacierVips[glacierId].date_from_mass.toFixed(0) + ' &ndash; ' + glacierVips[glacierId].date_to_mass.toFixed(0);   
infoboxMassDuration.innerHTML = glacierVips[glacierId].mass_anzahl_jahre.toFixed(0) + ' Jahre';
infoboxLengthCumulative.innerHTML = unit(glacierVips[glacierId].last_length_change_cumulative);
infoboxMassCumulative.innerHTML = unit(glacierVips[glacierId].last_mass_change_cumulative) + '&sup3;';


var selectedOverlay = new VectorLayer({
  source: new Vector(),
  map: map,
  style: selectStyle
});

// when the user clicks on a feature, get the name property
// from each feature under the mouse and display it
  function onMapClick(browserEvent) {
    var coordinate = browserEvent.coordinate;
    var pixel = map.getPixelFromCoordinate(coordinate);

//fill infobox from feature    
//manche Gletscherpunkte sind so dicht zusammen dass mehr als einer gelesen wird
//es wird nur das letzte feature gelesen und geschrieben da es ueberschrieben wird in der foreach-schleife
    let lastFeature = null;
    map.forEachFeatureAtPixel(pixel, function(feature) {
      var has_mass_value = feature.get('has_mass_value');
      var has_length_value = feature.get('has_length_value');
      var selected;
      //click nur wenn es werte oder namen hat
        if (has_mass_value == 't' || has_length_value == 't'){
          if (feature.get('has_mass_value') == 't') {
            infoboxMassTimespan.innerHTML = feature.get('date_from_mass').toFixed(0) + ' &ndash; ' + feature.get('date_to_mass').toFixed(0);   
            infoboxMassDuration.innerHTML = feature.get('mass_anzahl_jahre').toFixed(0) + ' Jahre';
            infoboxMassCumulative.innerHTML = unit(feature.get('last_mass_change_cumulative')) + '&sup3;';
          }
          else {
            infoboxMassTimespan.innerHTML = 'no data';
            infoboxMassDuration.innerHTML = 'no data';
            infoboxMassCumulative.innerHTML = 'no data';
          }

          if (feature.get('has_length_value')== 't') {
            infoboxLengthTimespan.innerHTML = feature.get('date_from_length').toFixed(0) + ' &ndash; ' + feature.get('date_to_length').toFixed(0);     
            infoboxLengthDuration.innerHTML = feature.get('length_anzahl_jahre').toFixed(0) + ' Jahre';
            infoboxLengthCumulative.innerHTML = unit(feature.get('last_length_change_cumulative'));
          }
          else {
            infoboxLengthTimespan.innerHTML = 'no data';
            infoboxLengthDuration.innerHTML = 'no data';
            infoboxLengthCumulative.innerHTML = 'no data';
          }
            infoboxGlacierName.innerHTML = feature.get('glacier_short_name');

            //TODO wenn null = leer
            lastFeature = feature;
        }

        if (feature !== selected) {
          if (selected) {
            selectedOverlay.getSource().removeFeature(selected);
            hoverOverlay.getSource().removeFeature(hover);
          }
          if (feature) {
            selectedOverlay.getSource().addFeature(feature);
          }
          selected = feature;
        }

    });
  };
  
  map.on('click',onMapClick);


//add hoverstyle 
var hoverOverlay = new VectorLayer({
  source: new Vector(),
  map: map,
  style: hoverStyle
});

var hover;
var featureHover = function(pixel) {
  var feature = map.forEachFeatureAtPixel(pixel, function(feature) {

    var has_mass_value = feature.get('has_mass_value');
    var has_length_value = feature.get('has_length_value');

    //click nur wenn es werte oder namen hat
      if (has_mass_value == 't' || has_length_value == 't'){
        return feature;
      };

      return;
  });

  if (feature !== hover) {
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
map.on('pointermove', function(e) {
  if (e.dragging) return;      
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);       
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
  featureHover(pixel);
});




      //TODO: Fallunterscheidung: falls name nicht vorhanden nehme sgi id
    //pushstate
    //window.location.pathname.split("/").slice(1).join("/"));
    //window.location = "/glacier/name/" + encodeURIComponent(lastFeature.get("glacier_short_name"));