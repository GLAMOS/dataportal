import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

  var glamos_sgi_1973 = new TileLayer({
    source: new TileWMS({
      attribution: '(C) glamos.ch',
      url: 'http://www.glamos.ch/qgis/sgi',
      params: {
        'LAYERS': 'SGI_1973',
        'TRANSPARENT': true,
      },
      serverType: 'qgis'                                         
    })
  });

  export default glamos_sgi_1973;