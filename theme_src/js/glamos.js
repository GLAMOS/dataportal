import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import ieDetector from './ieDetector';
ieDetector();


$(document).ready(function () {

  //initialise Mobile Menu
  $("#mainMobileNav").mmenu();

  //initialise mapviewer menu
  $("#navMapViewer").mmenu({
    navbar: false,
    extensions: ["position-right"]
  });

  //initializes the single preview image lightbox
  $('.imgGallery').lightGallery({
    selector: '.zoomItem',
    download: false
  });

  //initialize download Tabs
  $('ul.tabLinks a').on('click', function () {
    const CLASS_NAME = 'current';
    const TAB_ID = $(this).attr('data-tab');
    const HREF_VALUE = $(this).attr("href");

    $('ul.tabLinks a').removeClass(CLASS_NAME);
    $('.tabPanel').removeClass(CLASS_NAME);

    $(this).addClass(CLASS_NAME);
    $('#' + TAB_ID).addClass(CLASS_NAME);

    //add hash to url
    if(history.pushState) {
      history.pushState(null, null, HREF_VALUE);
    }
    else {
        location.hash = HREF_VALUE;
    }

  });

});
