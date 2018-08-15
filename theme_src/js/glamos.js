import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';
import ieDetector from './ieDetector';
ieDetector();


$(document).ready(function () {

  //initialise Mobile Menu
  $("#mainMobileNav").mmenu({

  });

  //initialise mapviewer menu
  $("#navMapViewer").mmenu({
    navbar: false,
    extensions: ["position-right"]
  });

  //initializes the single preview image lightbox
  $('.imgGallery').lightGallery({
    selector: '.zoomItem'
  });
  $('#allImages').lightGallery({
    selector: '.zoomItem'
  });
  //initializes all images which are hidden ini

});
