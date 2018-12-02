import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import c3 from 'c3';

import ieDetector from '@kspr/gugus-ie-detector';
ieDetector();

import controller from './controller'

import './map/map.js';

(function (global, $) {
  function getDate (dateString)
  {
    return dateString.replace(/\//g, '-');
  }

  function formatNumber (value)
  {
    return String(value).replace('-', '&minus;');
  }

  function selectDownloadTab(TAB_ID) {
    const CLASS_NAME = 'current';
    $('ul.tabLinks a').removeClass(CLASS_NAME);
    $('.tabPanel').removeClass(CLASS_NAME);

    $(this).addClass(CLASS_NAME);
    $('#' + TAB_ID).addClass(CLASS_NAME);
  }

  $(document).ready(function () {
    //initialise Mobile Menu //
    $('#mainMobileNav').mmenu();

    //initialise mapviewer menu
    $("#navMapViewer").mmenu({
      navbar: false,
      extensions: ["position-right"]
    });

    //if link is in dropdown pass activeclass along to toplevel
    $(".active").parent().closest('.dropDown').addClass('active');

    //initializes the single preview image lightbox
    $('.imgGallery').lightGallery({
      selector: '.zoomItem',
      download: false
    });

    //initialize download Tabs
    $('ul.tabLinks a').on('click', function (ev) {
      ev.preventDefault()
      const TAB_ID = $(this).attr('data-tab');

      selectDownloadTab(TAB_ID)

      controller.changeDownloadTab(TAB_ID)
    });

    //scroll to anchor
    $(".anchorNav a").click(function(e) {
        e.preventDefault();
        var aid = $(this).attr("href");
        $('html,body').animate({scrollTop: $(aid).offset().top},'slow');
    });

    //sticky anchor anchorNav
    $(window).scroll(function(){
      var offset = 0;
    	var sticky = false;
    	var top = $(window).scrollTop();

    	if ($(".mm-page").offset().top < top) {
    		$(".stickyNav").addClass("sticky");
    		sticky = true;
    	} else {
    		$(".stickyNav").removeClass("sticky");
    	}
    });

    const URI = '/geo/griessgletscher_length_change.geojson';
    let loaded = false;
    const onload = function () {
      loaded = true;
      const json = JSON.parse(xhr.responseText);
      const DATA = json.features.map((feature) => feature.properties);
      const X_AXIS_NAME = 'Datum';
      const LINE_LABEL = DATA[0].glacier_short_name;
      const YEARS = [X_AXIS_NAME, getDate(DATA[0].date_from_length)]
        .concat(DATA.map((entry) => getDate(entry.date_to_length)));
      const CUM_LENGTHS = [LINE_LABEL, 0]
        .concat(DATA.map((entry) => entry.length_cum));

      // console.log(DATA);
      // console.log(YEARS);
      // console.log(CUM_LENGTHS);

      const CHART = c3.generate({
        bindto: '#chart',
        data: {
          columns: [YEARS, CUM_LENGTHS],
          type: 'spline',
          xs: {
            [LINE_LABEL]: X_AXIS_NAME
          },
          axes: {
            [LINE_LABEL]: 'y'
          }
        },
        legend: {
          show: false
        },
        grid: {
          y: { show: true },
          x: { show: true }
        },
        axis: {
          x: {
            tick: {
              format: '%Y', //-%m-%d'
              outer: false,
              rotate: 45
            },
            type: 'timeseries',
          },
          y: {
            label: {
              position: 'inner-middle',
              text: 'Kumulative Längenänderung (m)',
            },
            tick: {
              outer: false,
            }
          }
        },
        tooltip: {
          format: {
            value (value) { return `${formatNumber(value)}\xA0m`; }
          }
        }
      });
    };

    /* TODO: Write a fetch API wrapper */
    // fetch(URI)
    // .then((response) => response.json())
    // .then((json) => {
    if (typeof XMLHttpRequest == 'undefined')
    {
      global.XMLHttpRequest = function () {
        let xhr = null;

        /* Legacy IE */
        try
        {
          xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        catch (e) {}

        return xhr;
      };
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', URI, true);
    xhr.onload = onload;
    xhr.onreadystatechange = function () {
      if (loaded) return;
      if (xhr.readyState == 4 && xhr.status === 200)
      {
        loaded = true;
        onload();
      }
    };
    xhr.send(null);
  });
}(this, $));
