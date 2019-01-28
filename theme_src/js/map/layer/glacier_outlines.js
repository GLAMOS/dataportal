import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import Translation from '../../Translation'
const t = Translation('.layerSwitcher')

  var glacier_outlines = new TileLayer({
    title: t("Gletscher Umrisse"),
    source: new TileWMS({
      attribution: '(C) glamos.ch',
      url: 'https://ogc.glamos.ch/sgi', 
      params: {
        'LAYERS': 'Glacier_Outlines',
        'TRANSPARENT': true,
      },
      serverType: 'qgis',
      displayInLayerSwitcher: true
    })
  });

  export default glacier_outlines;
