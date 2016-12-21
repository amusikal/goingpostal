(function () {
  'use strict';

  var doc = document;

  doc.addEventListener('DOMContentLoaded', function() {
    var html = doc.getElementsByTagName('html')[0];
    var body = doc.getElementsByTagName('body')[0];
    var closeMenuBtn = doc.querySelector('.nav-header-close-nav');
    var menuBtn = doc.querySelector('.nav-menu-button');
    var nav = doc.querySelector('.nav');
    var overlay = doc.querySelector('.overlay');
    var mainContent = doc.querySelector('.main-content');

    function toggleMenu() {
      nav.classList.toggle('is-open');
      overlay.classList.toggle('is-active');
      html.classList.toggle('is-locked');
      body.classList.toggle('is-locked');
    }

    [menuBtn, closeMenuBtn, overlay].forEach(function(element) {
      element.addEventListener('click', toggleMenu);
    });

    // The reason this exists is to allow Safari on iOS to hide
    // the 'Manage post' pop-up to revert back to being hidden when
    // the user clicks away
    mainContent.addEventListener('click', function(e) {
      return;
    });
  });
})();
