import TileLayer from 'ol/layer/Tile';
import XYZLayer from 'ol/source/XYZ';
import Translation from '../../Translation'
const t = Translation('.layerSwitcher')

var siegfried_wmts = new TileLayer({
  source: new XYZLayer({
    url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.hiks-siegfried/default/19260101/3857/{z}/{x}/{y}.png',
    attributions: '© <a target="new" href="https://www.swisstopo.admin.ch/">swisstopo</a>'
  }),
  baseLayer: true,
  title: t("Siegfried-Karte 1926"),
});

export default siegfried_wmts;
