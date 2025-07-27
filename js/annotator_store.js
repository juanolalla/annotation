/**
 * @file
 * Attaches behaviors for Annotator's store plugin.
 */

(function ($) {

  'use strict';

  Backdrop.behaviors.annotatorStore = {
    attach: function (context, settings) {
      Backdrop.Annotator.annotator('addPlugin', 'Store', {
        prefix: settings.annotator_store.prefix,
        urls: settings.annotator_store.urls,
        showViewPermissionsCheckbox: settings.annotator_store.showViewPermissionsCheckbox,
        showEditPermissionsCheckbox: settings.annotator_store.showEditPermissionsCheckbox,
        annotationData: {
          'uri': window.location.href,
          'type': 'annotator'
        },
        loadFromSearch: {
          'limit': 0,
          'uri': window.location.href
        }
      });
    }
  };

})(jQuery);
