import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import c3 from 'c3';
import ieDetector from './ieDetector';
ieDetector();


$(document).ready(function () {
  //initialise Mobile Menu
  $('#mainMobileNav').mmenu();

  //initialise mapviewer menu
  $('#navMapViewer').mmenu({
    navbar: false,
    extensions: ['position-right']
  });

  //initializes the single preview image lightbox
  $('.imgGallery').lightGallery({
    selector: '.zoomItem'
  });

  //initialize download Tabs
  $('ul.tabLinks a').on('click', function () {
    const CLASS_NAME = 'current';
    const TAB_ID = $(this).attr('data-tab');
    const HREF_VALUE = $(this).attr('href');

    $('ul.tabLinks a').removeClass(CLASS_NAME);
    $('.tabPanel').removeClass(CLASS_NAME);

    $(this).addClass(CLASS_NAME);
    $('#' + TAB_ID).addClass(CLASS_NAME);

    //add hash to url
    if (history.pushState) {
      history.pushState(null, null, HREF_VALUE);
    }
    else {
      location.hash = HREF_VALUE;
    }
  });

  const chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: [
        ['data1', 30, 200, 100, 400, 150, 250],
        ['data2', 50, 20, 10, 40, 15, 25]
      ],
      axes: {
        data2: 'y2'
      }
    },
    axis: {
      y: {
        label: { // ADD
          text: 'Y Label',
          position: 'outer-middle'
        }
      },
      y2: {
        show: true,
        label: { // ADD
          text: 'Y2 Label',
          position: 'outer-middle'
        }
      }
    }
  });
});
