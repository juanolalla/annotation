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

      // Configure ownership awareness so Recogito hides edit/delete for non-owners.
      var currentUser = (Backdrop.settings && Backdrop.settings.recogito && Backdrop.settings.recogito.currentUser) || { id: 0, name: '' };
      if (r && typeof r.setAuthInfo === 'function') {
        // For admins, we still set auth info but will allow full control via UI fallback below.
        if (currentUser && currentUser.id) {
          try {
            r.setAuthInfo({ id: String(currentUser.id), displayName: currentUser.name || ('User ' + currentUser.id) });
          } catch (e) {
            if (window.console && console.warn) console.warn('Failed to set Recogito auth info:', e);
          }
        }
      }

      // UI fallback to hide edit/delete on non-owned annotations for non-admins.
      function isOwner(anno) {
        if (!anno) return false;
        // Preferred: creator is an object with id.
        if (anno.creator && typeof anno.creator === 'object' && typeof anno.creator.id !== 'undefined' && currentUser && typeof currentUser.id !== 'undefined') {
          return String(anno.creator.id) === String(currentUser.id);
        }
        // Fallback: creator as primitive equals id or name.
        if (typeof anno.creator !== 'undefined') {
          if (String(anno.creator) === String(currentUser.id)) return true;
          if (currentUser.name && String(anno.creator) === String(currentUser.name)) return true;
        }
        return false;
      }

      function updateEditorActionsVisibility(anno) {
        var editor = document.querySelector('.r6o-editor');
        if (!editor) return;
        try {
          // Prevent the MutationObserver from re-triggering while we make changes
          editor._annoUpdating = true;

          // Admins see all actions.
          if (perms && perms.canAdmin) return;

          var owner = isOwner(anno);
          var allow = !!perms && !!perms.canEditOwn && owner;

          // Toggle a readonly class for CSS-based fallbacks.
          if (!allow) {
            if (editor.className.indexOf('readonly') === -1) editor.className += ' readonly';
          } else {
            editor.className = editor.className.replace(/\breadonly\b/g, '').trim();
          }

          // 1) Specific known button classes (redundancy)
          var saveBtn = editor.querySelector('.r6o-update, .r6o-save, .r6o-btn-primary');
          var deleteBtn = editor.querySelector('.r6o-delete, .r6o-btn-danger');
          if (saveBtn) {
            saveBtn.style.display = allow ? '' : 'none';
            saveBtn.disabled = !allow;
          }
          if (deleteBtn) {
            deleteBtn.style.display = allow ? '' : 'none';
            deleteBtn.disabled = !allow;
          }

          // Hide the expand arrow and any action menus for non-owners
          var arrows = editor.querySelectorAll('.r6o-arrow-down, .r6o-arrow-up');
          for (var a = 0; a < arrows.length; a++) {
            arrows[a].style.display = allow ? '' : 'none';
          }
          var menus = editor.querySelectorAll('.r6o-menu, .r6o-actions, .r6o-actions-menu');
          for (var mm = 0; mm < menus.length; mm++) {
            menus[mm].style.display = allow ? '' : 'none';
            if (!allow) menus[mm].style.pointerEvents = 'none'; else menus[mm].style.pointerEvents = '';
          }

          // 2) Generic hardening: disable all inputs and buttons when not allowed
          if (!allow) {
            var inputs = editor.querySelectorAll('input, textarea, select, [contenteditable="true"], [contenteditable=""]');
            for (var i = 0; i < inputs.length; i++) {
              var el = inputs[i];
              // Disable form fields
              if (typeof el.disabled !== 'undefined') el.disabled = true;
              // Ensure contenteditable elements become non-editable
              if (el.getAttribute && el.getAttribute('contenteditable') !== null) {
                el.setAttribute('contenteditable', 'false');
              }
              // Also make textareas readOnly to prevent edits via keyboard
              if (typeof el.readOnly !== 'undefined') el.readOnly = true;
            }

            // Hide/disable all buttons in the editor footer/actions area
            var buttons = editor.querySelectorAll('button');
            for (var j = 0; j < buttons.length; j++) {
              var btn = buttons[j];
              // Keep close/cancel buttons visible if they exist (heuristic: look for "close" or "cancel" text)
              var label = (btn.textContent || btn.innerText || '').toLowerCase();
              var isCancel = label.indexOf('cancel') !== -1 || label.indexOf('close') !== -1;
              if (!isCancel) {
                btn.style.display = 'none';
              }
              btn.disabled = !isCancel;
            }
          } else {
            // Re-enable inputs/buttons for own annotations
            var reinp = editor.querySelectorAll('input, textarea, select');
            for (var k = 0; k < reinp.length; k++) {
              if (typeof reinp[k].disabled !== 'undefined') reinp[k].disabled = false;
              if (typeof reinp[k].readOnly !== 'undefined') reinp[k].readOnly = false;
            }
            var rebtns = editor.querySelectorAll('button');
            for (var m = 0; m < rebtns.length; m++) {
              rebtns[m].style.display = '';
              rebtns[m].disabled = false;
            }
          }
        } catch (e) {
          if (window.console && console.warn) console.warn('Failed to update editor actions visibility:', e);
        } finally {
          if (editor) editor._annoUpdating = false;
        }
      }

      // Hook into Recogito selection to toggle visibility when an annotation is opened.
      if (r && typeof r.on === 'function') {
        var lastSelectedAnno = null;
        r.on('selectAnnotation', function(anno) {
          lastSelectedAnno = anno;
          try { window.lastSelectedAnno = anno; } catch (e) {}
          setTimeout(function() { updateEditorActionsVisibility(anno); setupEditorObserver(); }, 50);
        });
      }

      // Observe the Recogito editor for dynamic changes and re-apply visibility rules.
      function setupEditorObserver() {
        try {
          var editor = document.querySelector('.r6o-editor');
          if (!editor) return;
          if (editor._annoObserverAttached) return;
          var observer = new MutationObserver(function() {
            if (editor._annoUpdating) return;
            updateEditorActionsVisibility(window.lastSelectedAnno || null);
          });
          observer.observe(editor, { childList: true, subtree: true });
          editor._annoObserverAttached = true;
        } catch (e) {
          if (window.console && console.warn) console.warn('Failed to setup editor observer:', e);
        }
      }

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
              // Block updates for non-owners (unless admin)
              if (!(perms && perms.canAdmin) && !isOwner(previous || annotation)) {
                return;
              }
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
            // Block deletes for non-owners (unless admin)
            if (!(perms && perms.canAdmin) && !isOwner(annotation)) {
              return;
            }
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
