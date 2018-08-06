import $ from 'jquery';
import 'jquery.mmenu';
import ieDetector from './ieDetector';
ieDetector();


$(document).ready(function () {

  //initialise Mobile Menu
  $("#mainMobileNav").mmenu();

  //initialise mapviewer menu
  $("#navMapViewer").mmenu({
    navbar: false
  });

});
