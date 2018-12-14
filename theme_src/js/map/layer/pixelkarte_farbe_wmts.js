import TileLayer from 'ol/layer/Tile';
import XYZLayer from 'ol/source/XYZ';

var pixelkarte_farbe_wmts = new TileLayer({
    source: new XYZLayer({
      url: 'https://wmts10.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg',
      attributions: '© <a target="new" href="https://www.swisstopo.admin.ch/internet/swisstopo/en/home.html">swisstopo</a>'
    }),
    baseLayer: true,
    title: "Landeskarte farbig"
  });

  export default pixelkarte_farbe_wmts;