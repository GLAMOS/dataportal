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



  var glamos_sgi_2010 = new TileLayer({
    source: new TileWMS({
      attribution: '(C) glamos.ch',
      url: 'http://www.glamos.ch/qgis/sgi',
      params: {
        'LAYERS': 'SGI_2010',
        'TRANSPARENT': true,
      },
      serverType: 'qgis'                                         
    })
  });

  var glamos_sgi_1973 = new TileLayer({
    source: new TileWMS({
      attribution: '(C) glamos.ch',
      url: 'http://www.glamos.ch/qgis/sgi',
      params: {
        'LAYERS': 'SGI_1973',
        'TRANSPARENT': true,
      },
      serverType: 'qgis'                                         
    })
  });

  var glamos_sgi_1850 = new TileLayer({
    source: new TileWMS({
      attribution: '(C) glamos.ch',
      url: 'http://www.glamos.ch/qgis/sgi',
      params: {
        'LAYERS': 'SGI_1850',
        'TRANSPARENT': true,
      },
      serverType: 'qgis'                                         
    })
  });

  //ist im moment statische datei - sollte vom glamosserver kommen
  var gletscher_alle = new VectorLayer({
    source: new Vector({
        format: new GeoJSON(),
        url: '/geo/glamos_inventory_dummy.geojson'
    }),
    style: new Style({
        image: new Circle(({
            radius: 3,
            fill: new Fill({
                color: 'black'
            })
        }))
    })  
  });



// define 3 Map instances each for one tab: 
// Frage an die Experten. waere es nicht besser dies jeweils erst zu laden wenn der jeweilige Tab geladen wird?
// wenn ja, wo steuert man wann was geladen wird?

//only one map-layer, static map with glacier in center (dynamically set)
  const map_factsheet = new Map({
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

  //only one map-layer - no layerswitcher
  const home_map = new Map({
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
 

  const map_monitoring = new Map({
    target: 'monitoring-map',
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

var infoboxGlacierName = document.getElementById("infobox-glaciername");
infoboxGlacierName.innerHTML = glacierVips[glacierId].glacier_short_name;

var infoboxLengthCumulative = document.getElementById("infobox-length--cumulative");
var l = glacierVips[glacierId].last_length_change_cumulative;

if (l >= -999 && l <= 999) { 
  infoboxLengthCumulative.innerHTML = l + ' m'; }
  else {
    infoboxLengthCumulative.innerHTML = Math.round(l / 100) / 10 + ' km';}

var infoboxMassCumulative = document.getElementById("infobox-mass--cumulative");
var m = glacierVips[glacierId].last_mass_change_cumulative;
  
if (m >= -999 && m <= 999) {
      infoboxMassCumulative.innerHTML = m + ' m&sup3;';  }
 else {
      infoboxMassCumulative.innerHTML = Math.round(m / 100) / 10 + ' km&sup3;';}

      //streng genommen kein singleValue!
var infoboxLengthTimespan = document.getElementById("infobox-length--timespan");
    infoboxLengthTimespan.innerHTML = glacierVips[glacierId].date_from_length.toFixed(0) + ' - ' + glacierVips[glacierId].date_to_length.toFixed(0);     

var infoboxLengthDuration = document.getElementById("infobox-length--duration");
    infoboxLengthDuration.innerHTML = glacierVips[glacierId].length_anzahl_jahre.toFixed(0) + ' Jahre';

var infoboxMassTimespan = document.getElementById("infobox-mass--timespan");
    infoboxMassTimespan.innerHTML = glacierVips[glacierId].date_from_mass.toFixed(0) + ' - ' + glacierVips[glacierId].date_to_mass.toFixed(0);   

var infoboxMassDuration = document.getElementById("infobox-mass--duration");
    infoboxMassDuration.innerHTML = glacierVips[glacierId].mass_anzahl_jahre.toFixed(0) + ' Jahre';

    //"pk_sgi": "C84\/16", "glacier_short_name_web": "albigna", "glacier_full_name": "ALBIGNA VADREC D' (Nr. 116)", "glacier_short_name": "Vadrec da l' Albigna",
 //"last_length_change_cumulative": -750.0, "last_mass_change_cumulative": -12445, "date_from_length": 1850.0, 
//"date_to_length": 2015.0, "length_anzahl_jahre": 165.0, "date_from_mass": 1954.0, "date_to_mass": 1960.0, "mass_anzahl_jahre": 6.0,


//Frage: Besser: Ausdehnung berechnen(dafür könnte man polygone aus datenbank verwenden) 
//zur vereinfachung: maxZoom festgelegt und nur Punkte eingelesen
home_map.getView().fit(extent_frompoint, {size:home_map.getSize(), maxZoom:12});



// when we move the mouse over a feature, change its style to
// highlight it temporarily
var hoverStyle = new Style({
    image: new Circle(({
        radius: 10,
        fill: new Fill({
            color: 'green'
        })
    }))
});

//add hoverstyle 
var featureOverlay = new VectorLayer({
    source: new Vector(),
    map: home_map,
    style: hoverStyle
  });

var hover;
var featureHover = function(pixel) {

    var feature = home_map.forEachFeatureAtPixel(pixel, function(feature) {
      return feature;
    });

    if (feature !== hover) {
      if (hover) {
        featureOverlay.getSource().removeFeature(hover);
      }
      if (feature) {
        featureOverlay.getSource().addFeature(feature);
      }
      hover = feature;
    }
};


//add pointerhand
home_map.on('pointermove', function(e) {
    if (e.dragging) return;      
    var pixel = home_map.getEventPixel(e.originalEvent);
    var hit = home_map.hasFeatureAtPixel(pixel);       
    home_map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    featureHover(pixel);
  });





// when the user clicks on a feature, get the name property
// from each feature under the mouse and display it
  function onMapClick(browserEvent) {
    var coordinate = browserEvent.coordinate;
    var pixel = home_map.getPixelFromCoordinate(coordinate);
    var el = document.getElementById('infobox-glaciername');
    
  //TODO: manche Gletscherpunkte sind so dicht zusammen dass mehr als einer gelesen wird
  //im moment wird nur das letzte feature gelesen und geschrieben da es ueberschrieben wird in der foreach-schleife
    let lastFeature = null;
    home_map.forEachFeatureAtPixel(pixel, function(feature) {
        if (feature){

            el.innerHTML = feature.get('glacier_short_name');
            lastFeature = feature;
        }
    });

    //TODO: Fallunterscheidung falls name nicht 
    //pushstate
    //window.location.pathname.split("/").slice(1).join("/"));
    //window.location = "/glacier/name/" + encodeURIComponent(lastFeature.get("name"));
  };
  
  home_map.on('click',onMapClick);