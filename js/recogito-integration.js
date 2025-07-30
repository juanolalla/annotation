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
        r.loadAnnotations('/annotation/load').then(function(annotations) {
          console.log('Loaded annotations:', annotations);
        });

        //r.loadAnnotations(Backdrop.settings.recogito.annotations);
        //console.log(Backdrop.settings.recogito.annotations);
        //console.log(Array.isArray(Backdrop.settings.recogito.annotations)); // Must be true
        // r.loadAnnotations([
        //   {
        //     body: [{ type: "TextualBody", value: "Test", purpose: "commenting" }],
        //     target: {
        //       selector: [{ type: "TextQuoteSelector", exact: "delete" }]
        //     }
        //   }
        // ]);

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
            } else {
              console.error('Annotation save failed:', result.message);
            }
          })
          .catch(error => {
            console.error('Annotation save error:', error);
          });
      });
    }
  };

})(Backdrop);
