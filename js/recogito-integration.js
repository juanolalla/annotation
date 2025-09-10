/**
 * @file
 * Integrates RecogitoJS with Backdrop.
 */

(function (Backdrop) {
  'use strict';

  Backdrop.behaviors.recogitoIntegration = {
    attach: function (context, settings) {
      // Determine selector from settings or fallback to default.
      var configuredSelector = (Backdrop.settings && Backdrop.settings.recogito && Backdrop.settings.recogito.selector)
        ? Backdrop.settings.recogito.selector
        : '.node';

      // Look up the content element safely. If multiple match, use their common ancestor.
      var matches = document.querySelectorAll(configuredSelector);
      var contentEl = null;
      if (!matches || matches.length === 0) {
        if (window.console && console.debug) {
          console.debug('Recogito: No element found for selector', configuredSelector);
        }
        return;
      } else if (matches.length === 1) {
        contentEl = matches[0];
      } else {
        // Compute common ancestor of all matches.
        var nodes = Array.prototype.slice.call(matches);
        var ancestor = nodes[0];
        while (ancestor) {
          if (nodes.every(function(n) { return ancestor.contains(n); })) {
            contentEl = ancestor;
            break;
          }
          ancestor = ancestor.parentElement;
        }
        if (!contentEl) contentEl = document.body;
        if (window.console && console.debug) {
          console.debug('Recogito: Multiple elements matched. Using common ancestor:', contentEl);
        }
      }

      // Ensure Recogito library is available.
      if (typeof Recogito === 'undefined' || !Recogito.init) {
        if (window.console && console.warn) {
          console.warn('Recogito library not available.');
        }
        return;
      }

      // Determine read-only mode from Backdrop settings permissions.
      var perms = (Backdrop.settings && Backdrop.settings.recogito && Backdrop.settings.recogito.permissions) || {};
      // Compute read-only defensively in case backend is outdated.
      var readOnly = ('readOnly' in perms) ? !!perms.readOnly : !(!!perms.canCreate || !!perms.canEditOwn || !!perms.canAdmin);

      var r = Recogito.init({
        content: contentEl,
        widgets: ['COMMENT'],
        readOnly: readOnly
      });

      // Map temporary (client) IDs to server-assigned IDs to ensure that
      // subsequent update/delete operations reference the correct entity
      // even if Recogito still holds the original temporary ID instance.
      var serverIdByTempId = Object.create(null);
      function resolveId(id) {
        return (id && serverIdByTempId[id]) ? serverIdByTempId[id] : id;
      }

      // Preload annotations from PHP (if provided in settings)
      var preload = (Backdrop.settings && Backdrop.settings.recogito && Array.isArray(Backdrop.settings.recogito.annotations))
        ? Backdrop.settings.recogito.annotations
        : [];
      if (preload.length) {
        try {
          r.setAnnotations(preload);
          if (window.console && console.debug) console.debug('Preloaded annotations from settings:', preload);
        } catch (e) {
          if (window.console && console.warn) console.warn('Failed to preload annotations:', e);
        }
      }

      // Also load (or refresh) annotations from the server
      r.loadAnnotations('/annotation/load?url=' + encodeURIComponent(window.location.pathname))
        .then(function(annotations) {
          console.log('Loaded annotations:', annotations);
        });

      if (!readOnly) {
        if (perms.canCreate || perms.canAdmin) {
          r.on('createAnnotation', function (annotation) {
            var body = '';
            if (annotation && annotation.body && annotation.body[0] && typeof annotation.body[0].value !== 'undefined') {
              body = annotation.body[0].value;
            }
            var selectors = (annotation && annotation.target && Array.isArray(annotation.target.selector)) ? annotation.target.selector : [];
            if (!selectors.length) {
              if (window.console && console.warn) {
                console.warn('Incomplete annotation selectors:', annotation);
              }
              return;
            }
            var payload = {
              url: window.location.pathname,
              body: body,
              selectors: selectors
            };
            fetch('/annotation/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
              .then(function(res) { return res.json(); })
              .then(function(result) {
                if (result.status === 'success') {
                  if (window.console && console.log) {
                    console.log('Annotation saved. ID:', result.id);
                  }
                  var tempId = annotation.id;
                  var serverId = String(result.id);
                  if (tempId) {
                    serverIdByTempId[tempId] = serverId;
                  }
                } else {
                  if (window.console && console.error) {
                    console.error('Annotation save failed:', result.message);
                  }
                }
              })
              .catch(function(error) {
                if (window.console && console.error) {
                  console.error('Annotation save error:', error);
                }
              });
          });
        }

        if (perms.canEditOwn || perms.canAdmin) {
          r.on('updateAnnotation', function (annotation, previous) {
            try {
              var body = '';
              if (annotation && annotation.body && annotation.body[0] && typeof annotation.body[0].value !== 'undefined') {
                body = annotation.body[0].value;
              }
              var selectors;
              if (annotation && annotation.target && Array.isArray(annotation.target.selector)) {
                selectors = annotation.target.selector;
              } else if (previous && previous.target && Array.isArray(previous.target.selector)) {
                selectors = previous.target.selector;
              } else {
                selectors = [];
              }
              var idToUse = resolveId((annotation && annotation.id) ? annotation.id : (previous ? previous.id : undefined));
              var payload = {
                id: idToUse,
                body: body,
                selectors: selectors
              };
              if (!payload.id) {
                if (window.console && console.warn) {
                  console.warn('Missing annotation id on update:', annotation, previous);
                }
                return;
              }
              fetch('/annotation/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              })
                .then(function(res) { return res.json(); })
                .then(function(result) {
                  if (result.status !== 'success') {
                    if (window.console && console.error) {
                      console.error('Annotation update failed:', result.message);
                    }
                  }
                })
                .catch(function(error) {
                  if (window.console && console.error) {
                    console.error('Annotation update error:', error);
                  }
                });
            } catch (e) {
              if (window.console && console.error) {
                console.error('Unexpected error preparing annotation update:', e);
              }
            }
          });

          r.on('deleteAnnotation', function (annotation) {
            var id = resolveId(annotation.id);
            if (!id) {
              if (window.console && console.warn) {
                console.warn('Missing annotation id on delete:', annotation);
              }
              return;
            }
            fetch('/annotation/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id })
            })
              .then(function(res) { return res.json(); })
              .then(function(result) {
                if (result.status !== 'success') {
                  if (window.console && console.error) {
                    console.error('Annotation delete failed:', result.message);
                  }
                }
              })
              .catch(function(error) {
                if (window.console && console.error) {
                  console.error('Annotation delete error:', error);
                }
              });
          });
        }
      }
    }
  };

})(Backdrop);
