import TileLayer from 'ol/layer/Tile';
import XYZLayer from 'ol/source/XYZ';
import Translation from '../../Translation'
const t = Translation('.layerSwitcher')

var swissimage_wmts = new TileLayer({
    source: new XYZLayer({
      url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg',
      attributions: '© <a target="new" href="https://www.swisstopo.admin.ch/">swisstopo</a>'
    }),
    baseLayer: true,
    title: t("Luftbilder"),
  });

  export default swissimage_wmts;
