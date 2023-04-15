const siteNavigation = document.querySelector('.site-navigation');
const siteNavigationButtonToggle = document.querySelector('.site-navigation__button-toggle');

siteNavigation.classList.remove('site-navigation--nojs');

siteNavigationButtonToggle.addEventListener('click', function () {
  if (siteNavigation.classList.contains('site-navigation--closed')) {
    siteNavigation.classList.remove('site-navigation--closed');
    siteNavigation.classList.add('site-navigation--opened');
  } else {
    siteNavigation.classList.add('site-navigation--closed');
    siteNavigation.classList.remove('site-navigation--opened');
  }
});
