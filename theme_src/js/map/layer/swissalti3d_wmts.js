import TileLayer from 'ol/layer/Tile';
import XYZLayer from 'ol/source/XYZ';

//Liste aller verfügbaren Tiles EPSG 3875: https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml
var swissalti3d_wmts = new TileLayer({
    source: new XYZLayer({
      url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissalti3d-reliefschattierung/default/current/3857/{z}/{x}/{y}.png',
      attributions: '© <a target="new" href="https://www.swisstopo.admin.ch/internet/swisstopo/en/home.html">swisstopo</a>'
    }),
    baseLayer: true,
    title: "Relief",
    minZoom: 8,
    maxZoom: 14
  });

  export default swissalti3d_wmts;