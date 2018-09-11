//all map directies
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
    layers: [swisstopo1,swisstopo2,swisstopo3,glamos_sgi],
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
    layers: [swisstopo1,swisstopo2,swisstopo3,glamos_sgi],
    //interactions: [], //remove all interactions like zoom, pan etc. for factsheetwindow 
    //controls: [],//remove zoom for factsheetwindow
    view: new View({
      center: [903280,5913450],
      zoom: 10,
      minZoom: 8,
      maxZoom: 12
    })
  });