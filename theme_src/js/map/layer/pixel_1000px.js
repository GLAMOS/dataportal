
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

var pixel_pk1000 = new TileLayer({
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

  export default pixel_pk1000;
  