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
import vips from './layer/gletscher_vip';
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
        url: '/geo/gletscher.geojson'
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
    target: 'map_factsheet',
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
  const map_home = new Map({
    target: 'map_home',
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
    target: 'map_monitoring',
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
var max = 20;
var glacierID =  Math.floor((Math.random() * (max - min)) + min);

//push all features into variable
var glacierVIPs = vips.features.map(function(el)
{
    return el.properties;
})

var randomX = glacierVIPs[glacierID].coordx;
var randomY = glacierVIPs[glacierID].coordy;
var extent_frompoint = [randomX, randomY, randomX, randomY];
var nameDiv = document.getElementById("currentGlacierName");
nameDiv.innerHTML = glacierVIPs[glacierID].name;

//Frage: Besser: Ausdehnung berechnen(dafür könnte man polygone aus datenbank verwenden) 
//zur vereinfachung: maxZoom festgelegt und nur Punkte eingelesen
map_home.getView().fit(extent_frompoint, {size:map_home.getSize(), maxZoom:12});



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
    map: map_home,
    style: hoverStyle
  });

var hover;
var featureHover = function(pixel) {

    var feature = map_home.forEachFeatureAtPixel(pixel, function(feature) {
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
map_home.on('pointermove', function(e) {
    if (e.dragging) return;      
    var pixel = map_home.getEventPixel(e.originalEvent);
    var hit = map_home.hasFeatureAtPixel(pixel);       
    map_home.getTargetElement().style.cursor = hit ? 'pointer' : '';
    featureHover(pixel);
  });

// when the user clicks on a feature, get the name property
// from each feature under the mouse and display it
  function onMapClick(browserEvent) {
    var coordinate = browserEvent.coordinate;
    var pixel = map_home.getPixelFromCoordinate(coordinate);
    var el = document.getElementById('currentGlacierName');
    
  //TODO: manche Gletscherpunkte sind so dicht zusammen dass mehr als einer gelesen wird
  //im moment wird nur das letzte feature gelesen und geschrieben da es ueberschrieben wird in der foreach-schleife
    let lastFeature = null;
    map_home.forEachFeatureAtPixel(pixel, function(feature) {
        if (feature){
            el.innerHTML = feature.get('name');
            lastFeature = feature;
        }
    });

    //TODO: Fallunterscheidung falls name nicht 
    //pushstate
    //window.location.pathname.split("/").slice(1).join("/"));
    //window.location = "/glacier/name/" + encodeURIComponent(lastFeature.get("name"));
  };
  
  map_home.on('click',onMapClick);