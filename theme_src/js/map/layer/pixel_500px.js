import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

var pixel_500px = new TileLayer({
    source: new TileWMS({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions: '© <a href="http://www.geo.admin.ch/internet/geoportal/en/home.html">Einteilung Letzteiszeitlisches Max. 500 Papier / geo.admin.ch</a>',
      params: {
        'LAYERS': 'ch.swisstopo.geologie-eiszeit-lgm-raster',
        'FORMAT': 'image/jpeg'
      },
      serverType: 'mapserver'
    }),
    minResolution: 2,
    maxResolution: 200
  });

  export default pixel_500px;