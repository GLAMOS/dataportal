import $ from 'jquery';
import mapboxgl from 'mapbox-gl';
import bbox from '@turf/bbox';
import moment from 'moment';

import 'jquery.mmenu';
import ieDetector from './ieDetector';
ieDetector();

const BBOX_OPTIONS = { padding: 100 };

function fixPos (pos)
{
  if (typeof pos === 'string') {
    return parseFloat(pos.replace(',', '.'));
  }

  return pos;
}

function initializeMap ()
{
  const COLOR_DEFAULT = '#fff';

  const $MAP = $('.map');
  const $SEARCH = $('.searchField');

  if ($MAP.length === 0 || $SEARCH.length === 0) {
    return;
  }

  const MAP_DATA = $MAP.data();

  const PARAMS = {
    lang: MAP_DATA.lang,
    key: MAP_DATA.key,
  };

  // Map
  mapboxgl.accessToken = 'pk.eyJ1IjoibWV0ZW90ZXN0IiwiYSI6Ik04ZXJpZm8ifQ.7bC_VfpMUnbPlbn1F22ijA';

  const MAP = new mapboxgl.Map({
    container: $MAP.get(0),
    style: 'mapbox://styles/meteotest/cjdizq3fb1ep12rsu829pf20c',
    center: [7.466965, 46.990885],
    zoom: 10,
    maxZoom: 13,
    minZoom: 6,
  });

  // Search & Markers
  const $INPUT = $SEARCH.find('#search-input');
  const $BUTTON = $SEARCH.find('button[name="button"]');
  const $STATIONS = $SEARCH.find('#search-results > *');

  const STATIONS = [];
  $STATIONS.each((index) => {
    const $STATION = $STATIONS.eq(index);
    STATIONS[index] = $STATION.data();
  });

  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  const FEATURES = STATIONS.map((station) => {
    let { measurementEnd } = station;
    if (measurementEnd) {
      try {
        measurementEnd = new Date(measurementEnd);
      } catch (exception) {}
    }

    const color = ((measurementEnd && (measurementEnd < TODAY))
                   || (station.maintenance === 1))
      ? COLOR_DEFAULT
      : station.color;

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [fixPos(station.lng), fixPos(station.lat)],
      },
      properties: {
        title: station.title,
        serialNumber: station.sn,
        uriGauge: MAP_DATA.api + station.id + '?' + $.param(PARAMS),
        uriDetails: station.url,
        color
      },
    };
  });

  MAP.on('load', () => {
    const DATA = {
      type: 'FeatureCollection',
      features: FEATURES,
    };

    MAP.addSource('stations', {
      type: 'geojson',
      data: DATA,
    });

    MAP.addLayer({
      id: 'markers',
      source: 'stations',
      type: 'circle',
      paint: {
        'circle-radius': 5,
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#000',
      },
    });

    MAP.fitBounds(bbox(DATA), BBOX_OPTIONS);
  });

  // https://www.mapbox.com/mapbox-gl-js/example/popup-on-click/
  MAP.on('click', 'markers', (event) => {
    event.preventDefault();

    const COORDINATES = event.features[0].geometry.coordinates.slice();

    const { title, uriGauge, uriDetails } = event.features[0].properties;

    const CONTENT = `
      <strong>${title}</strong>
      <iframe src="${uriGauge}"></iframe>
      <a href="${uriDetails}">Details</a>
    `;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(event.lngLat.lng - COORDINATES[0]) > 180) {
      COORDINATES[0] += event.lngLat.lng > COORDINATES[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(COORDINATES)
      .setHTML(CONTENT)
      .addTo(MAP);
  });

  MAP.on('mouseenter', 'markers', () => {
    MAP.getCanvas().style.cursor = 'pointer';
  });

  MAP.on('mouseleave', 'markers', () => {
    MAP.getCanvas().style.cursor = '';
  });

  function submitForm ()
  {
    const STATION_QUERY = $INPUT.val().toLowerCase();

    const FILTERED = {
      type: 'FeatureCollection',
      features: FEATURES.filter((feature, index) => {
        const { title, serialNumber } = feature.properties;
        const STATION_TEXT = title.toLowerCase() + serialNumber;
        const OFFSET = STATION_TEXT.indexOf(STATION_QUERY);
        const VISIBLE = (OFFSET !== -1);

        $STATIONS.eq(index).toggle(VISIBLE);
        return VISIBLE;
      }),
    };

    MAP.getSource('stations').setData(FILTERED);

    MAP.fitBounds(bbox(FILTERED), BBOX_OPTIONS);
  }

  $BUTTON.on('click', submitForm);

  $INPUT.on('keyup', (event) => {
    if (event.which === 13 /* ENTER */) {
      submitForm();
    }
  });
}

function initialzeChartSwitcher ()
{
  const $SWITCHER = $('#chart-switcher');
  const $FRAME = $('#chart-frame');

  if ($SWITCHER.length === 0 || $FRAME.length === 0) {
    return;
  }

  const FRAME_DATA = $FRAME.data();

  const $BUTTONS = $SWITCHER.find('button');
  $BUTTONS.each((index) => {
    const $BUTTON = $BUTTONS.eq(index);
    $BUTTON.on('click', () => {
      const DAYS = $BUTTON.data('days');
      const PARAMS = {
        lang: FRAME_DATA.lang,
        key: FRAME_DATA.key,
      };

      if (typeof DAYS === 'number') {
        const WHEN = moment().subtract({ days: DAYS });
        PARAMS.start = WHEN.format('YYYY-MM-DD');
      }

      $BUTTONS.removeClass('current');
      $BUTTON.addClass('current');

      const URI = FRAME_DATA.api + '?' + $.param(PARAMS);
      $FRAME.attr('src', URI);
    });
  });
}

$(document).ready(function () {
  //Hambuerger Menu
  $('#mobileMenu').mmenu();

  //Tabs
  $('ul.tabLinks li').on('click', function () {
    const CLASS_NAME = 'current';
    const TAB_ID = $(this).attr('data-tab');

    $('ul.tabLinks li').removeClass(CLASS_NAME);
    $('.tabPanel').removeClass(CLASS_NAME);

    $(this).addClass(CLASS_NAME);
    $('#' + TAB_ID).addClass(CLASS_NAME);
  });

  //Map Legend Toggle Button
  $('#toggleLegend').click(function(e){
    $('.mapLegend ul').fadeToggle('slow')
  });

  //Lightbox
  $('.lightGallery').lightGallery({
    selector: '.lightBoxItem',
    download: false
  });

  initializeMap();
  initialzeChartSwitcher();
});
