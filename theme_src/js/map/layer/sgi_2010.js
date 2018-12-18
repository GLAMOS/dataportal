import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

var glamos_sgi_2010 = new TileLayer({
    title: "2010",
    source: new TileWMS({
      attribution: '(C) glamos.ch',
      url: 'https://ogc.glamos.ch/sgi',
      params: {
        'LAYERS': 'SGI_2010',
        'TRANSPARENT': true,
      },
      serverType: 'qgis',
      displayInLayerSwitcher: true
    })
  });
export default glamos_sgi_2010;