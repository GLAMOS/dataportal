import TileLayer from 'ol/layer/Tile';
import XYZLayer from 'ol/source/XYZ';
import Translation from '../../Translation'
const t = Translation('.layerSwitcher')

//Liste aller verfügbaren Tiles EPSG 3875: https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml
var eiszeit_wmts = new TileLayer({
    source: new XYZLayer({
      url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.geologie-eiszeit-lgm-raster/default/20081231/3857/{z}/{x}/{y}.png',
      attributions: '© <a target="new" href="https://www.swisstopo.admin.ch/">swisstopo</a>'
    }),
    baseLayer: true,
    title: t("Eiszeit max. Ausdehnung")
  });

  export default eiszeit_wmts;
