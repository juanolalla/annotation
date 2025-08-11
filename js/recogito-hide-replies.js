/**
 * @file
 * Hides RecogitoJS reply widgets by only displaying the first comment widget
 * within the editor panel. Keeps create/edit/delete of main annotation intact.
 */

(function (Backdrop) {
  'use strict';

  /* global console */

  // Guard to avoid setting up multiple observers on repeated attaches
  var REPLY_HIDER_KEY = '__recogitoReplyHider__';

  function hideExtraCommentWidgets(root) {
    var containers = (root || document).querySelectorAll('.r6o-editor-inner');
    containers.forEach(function(inner) {
      var comments = inner.querySelectorAll('.r6o-widget.comment');
      if (comments.length > 0) {
        // Show first, hide the rest
        comments[0].style.removeProperty('display');
        for (var i = 1; i < comments.length; i++) {
          comments[i].style.setProperty('display', 'none', 'important');
        }
      }
    });
  }

  Backdrop.behaviors.recogitoHideReplies = {
    attach: function (context, settings) {
      // Only run once per page load
      if (window[REPLY_HIDER_KEY]) { return; }
      window[REPLY_HIDER_KEY] = true;

      // Initial pass in case editor already exists
      hideExtraCommentWidgets();

      // Observe DOM changes to re-apply when editor opens/updates
      var observer = new MutationObserver(function(mutations) {
        var needsUpdate = false;
        mutations.forEach(function(m) {
          if (m.type === 'childList' && (m.addedNodes && m.addedNodes.length)) { needsUpdate = true; }
          if (m.type === 'attributes' && m.target && m.target.closest && m.target.closest('.r6o-editor-inner')) { needsUpdate = true; }
        });
        if (needsUpdate) { hideExtraCommentWidgets(); }
      });

      try {
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
      } catch (e) {
        // Non-fatal; the initial pass still applies
        if (window.console && console.warn) {
          console.warn('Recogito reply hider: MutationObserver setup failed:', e);
        }
      }
    }
  };

})(Backdrop);
