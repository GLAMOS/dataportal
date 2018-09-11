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
import vips from './gletscher_vip';


//define all Layers to be shown on map
var swisstopo1 = new TileLayer({
    source: new TileWMS({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions: '© <a href="http://www.geo.admin.ch/internet/geoportal/en/home.html">Pixelmap 1:1.000.000 / geo.admin.ch</a>',
      params: {
        'LAYERS': 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
        'FORMAT': 'image/jpeg'
      },
      serverType: 'mapserver'
    }),
    minResolution: 20
  });


  var swisstopo2 = new TileLayer({
    source: new TileWMS({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions: '© <a href="http://www.geo.admin.ch/internet/geoportal/en/home.html">Einteilung Letzteiszeitlisches Max. 500 Papier / geo.admin.ch</a>',
      params: {
        'LAYERS': 'ch.swisstopo.geologie-eiszeit-lgm-raster',
        'FORMAT': 'image/jpeg'
      },
      serverType: 'mapserver'
    }),
    minResolution: 2,
    maxResolution: 200
  });

var swisstopo3 = new TileLayer({
    source: new TileWMS({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions: '© <a href="http://www.geo.admin.ch/internet/geoportal/en/home.html">Einteilung Letzteiszeitlisches Max. 500 Papier / geo.admin.ch</a>',
      params: {
        'LAYERS': 'ch.swisstopo.geologie-eiszeit-lgm-raster',
        'FORMAT': 'image/jpeg'
      },
      serverType: 'mapserver'
    }),
    minResolution: 2,
    maxResolution: 200
  });

  var glamos_sgi = new TileLayer({
    source: new TileWMS({
      attribution: '(C) glamos.ch',
      url: 'http://www.glamos.ch/qgis/sgi',
      params: {
        'LAYERS': 'SGI_Division',
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
    layers: [swisstopo3],
    interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow 
    controls: [],//remove zoom for factsheetwindow
    view: new View({
      center: [903280,5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 12
    })
  });

  //only one map-layer - no layerswitcher
  const map_home = new Map({
    target: 'map_home',
    layers: [swisstopo1,swisstopo2,swisstopo3,glamos_sgi,gletscher_alle],
    //interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow 
    //controls: [],//remove zoom for factsheetwindow
    view: new View({
      center: [903280,5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 12
    })
  });
 

  const map_monitoring = new Map({
    target: 'map_monitoring',
    layers: [swisstopo1,swisstopo2,swisstopo3,glamos_sgi,gletscher_alle],
    //interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow 
    //controls: [],//remove zoom for factsheetwindow
    view: new View({
      center: [903280,5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 12
    })
  });


  //es wird ein Gletscher gelesen aus einer liste von 20 definierten VIPs
//todo: aus geoJSON ermitteln wieviele Gletscher die Liste enthaelt
var min = 1;
var max = 20;
var glacierID =  Math.floor((Math.random() * (max - min)) + min);

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




// when the user moves the mouse, get the name property
  // from each feature under the mouse and display it


  function onMapClick(browserEvent) {
    var coordinate = browserEvent.coordinate;
    var pixel = map_home.getPixelFromCoordinate(coordinate);
    var el = document.getElementById('currentGlacierName');
    
  //Problem: manche Gletscherpunkte sind so dicht zusammen dass mehr als einer gelesen wird
  //im moment wird nur das letzte feature gelesen und geschrieben da es ueberschrieben wird in der foreach-schleife
    map_home.forEachFeatureAtPixel(pixel, function(feature) {
        if (feature){
            el.innerHTML = '';
            el.innerHTML += feature.get('name') + '<br>';
    }
    });
  };
  
  map_home.on('click',onMapClick);