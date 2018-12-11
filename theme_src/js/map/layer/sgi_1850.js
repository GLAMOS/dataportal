import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

  var glamos_sgi_1850 = new TileLayer({
    title: "1850",
    source: new TileWMS({
      attribution: '(C) glamos.ch',
      url: 'https://ogc.glamos.ch/sgi',
      params: {
        'LAYERS': 'SGI_1850',
        'TRANSPARENT': true,
      },
      serverType: 'qgis',
      displayInLayerSwitcher: true
    })
  });

  export default glamos_sgi_1850;