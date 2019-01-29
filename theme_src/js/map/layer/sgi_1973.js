import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import Translation from '../../Translation'
const t = Translation('.layerSwitcher')

var glamos_sgi_1973 = new TileLayer({
  title: t("1973"),
  source: new TileWMS({
    attribution: '(C) glamos.ch',
    url: 'https://ogc.glamos.ch/sgi',
    params: {
      'LAYERS': 'SGI_1973',
      'TRANSPARENT': true,
    },
    serverType: 'qgis',
    displayInLayerSwitcher: true
  })
});

export default glamos_sgi_1973;
