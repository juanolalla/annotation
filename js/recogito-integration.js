/**
 * @file
 * Integrates RecogitoJS with Backdrop.
 */

(function (Backdrop) {
  'use strict';

  Backdrop.behaviors.recogitoIntegration = {
    attach: function (context, settings) {
      var r = Recogito.init({
        //content: document.getElementsByClassName('page')[0],
        content: document.querySelector('.field-name-body .field-item'),
        widgets: ['COMMENT']
      });

      // Preload annotations from PHP
      if (Backdrop.settings.recogito && Array.isArray(Backdrop.settings.recogito.annotations)) {
        r.loadAnnotations('/annotation/load?url=' + encodeURIComponent(window.location.pathname))
          .then(function(annotations) {
            console.log('Loaded annotations:', annotations);
        });
      }

      // Save new annotations to Backdrop
      r.on('createAnnotation', function (annotation) {
        const body = annotation.body?.[0]?.value || '';
        const position = annotation.target?.selector?.find(sel => sel.type === 'TextPositionSelector');
        const quote = annotation.target?.selector?.find(sel => sel.type === 'TextQuoteSelector');

        if (!body || !position || !quote) {
          console.warn('Incomplete annotation data:', annotation);
          return;
        }

        const payload = {
          url: window.location.pathname,
          body: body,
          target: quote.exact,
          start: position.start,
          end: position.end
        };

        fetch('/annotation/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(res => res.json())
          .then(result => {
            if (result.status === 'success') {
              console.log('Annotation saved. ID:', result.id);
              // Ensure future updates/deletes carry the server ID
              annotation.id = String(result.id);
            } else {
              console.error('Annotation save failed:', result.message);
            }
          })
          .catch(error => {
            console.error('Annotation save error:', error);
          });
      });

      // Update existing annotations in Backdrop
      r.on('updateAnnotation', function (annotation, previous) {
        try {
          const body = annotation.body?.[0]?.value || '';
          const position = annotation.target?.selector?.find(sel => sel.type === 'TextPositionSelector');
          const quote = annotation.target?.selector?.find(sel => sel.type === 'TextQuoteSelector');

          const payload = {
            id: annotation.id || previous?.id,
            body: body,
            target: quote ? quote.exact : previous?.target?.selector?.find(sel => sel.type === 'TextQuoteSelector')?.exact,
            start: position ? position.start : previous?.target?.selector?.find(sel => sel.type === 'TextPositionSelector')?.start,
            end: position ? position.end : previous?.target?.selector?.find(sel => sel.type === 'TextPositionSelector')?.end
          };

          if (!payload.id) {
            console.warn('Missing annotation id on update:', annotation, previous);
            return;
          }

          fetch('/annotation/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
            .then(res => res.json())
            .then(result => {
              if (result.status !== 'success') {
                console.error('Annotation update failed:', result.message);
              }
            })
            .catch(error => {
              console.error('Annotation update error:', error);
            });
        } catch (e) {
          console.error('Unexpected error preparing annotation update:', e);
        }
      });

      // Delete annotations in Backdrop
      r.on('deleteAnnotation', function (annotation) {
        const id = annotation.id;
        if (!id) {
          console.warn('Missing annotation id on delete:', annotation);
          return;
        }
        fetch('/annotation/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id })
        })
          .then(res => res.json())
          .then(result => {
            if (result.status !== 'success') {
              console.error('Annotation delete failed:', result.message);
            }
          })
          .catch(error => {
            console.error('Annotation delete error:', error);
          });
      });
    }
  };

})(Backdrop);
