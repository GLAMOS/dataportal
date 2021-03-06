import TileLayer from 'ol/layer/Tile';
import XYZLayer from 'ol/source/XYZ';
import Translation from '../../Translation'
const t = Translation('.layerSwitcher')

var pixelkarte_grau_wmts = new TileLayer({
  source: new XYZLayer({
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
    attributions: '© <a target="new" href="https://www.swisstopo.admin.ch/">swisstopo</a>'
  }),
  baseLayer: true,
  title: t("Landeskarte grau")
});

export default pixelkarte_grau_wmts;
