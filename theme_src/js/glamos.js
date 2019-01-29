import $ from 'jquery';
import 'jquery.mmenu';
import 'lightgallery';

import controller from './controller';

import './map/map.js';
import sidepane from './map/monitoringSidepane';


(function (global, $) {
  function getAvailableDownloadTabs() {
    return $('.tabContainer a[data-tab]').map((_ix, el) => el.getAttribute('data-tab'));
  }
  controller.bridge({ getAvailableDownloadTabs });

  function selectDownloadTab(TAB_ID) {
    const CLASS_NAME = 'current';
    $('ul.tabLinks a').removeClass(CLASS_NAME);
    $('.tabPanel').removeClass(CLASS_NAME);

    $(`a[data-tab="${TAB_ID}"]`).addClass(CLASS_NAME);
    $(`#${TAB_ID}`).addClass(CLASS_NAME);
  }
  controller.bridge({ selectDownloadTab });
}(global, $));


$(document).ready(() => {
  /* initializing */
  controller.onPageLoad();
  sidepane.setup();

  // fire mobile menu drawer
  $("#mainMobileNav").mmenu();

  //fire the lightgallery plugin
  $(".imgGallery").lightGallery({
    download: false
  });

  // glossar anchor scroll animation
  if ($(".glossarListing").length) {
    $("a[href^='#']").on("click", function (e) {
      e.preventDefault();
      $("html, body").animate({
        scrollTop: $($(this).attr("href")).offset().top
      }, 1000);
    });

    if ($(window.location.hash).length > 1) {
      $("html, body").animate({
        scrollTop: $(window.location.hash).offset().top
      }, 1000);
    }
  }

});
