<?php
/**
 * @file
 * Views custom field handler for rendering the quote extracted from selectors.
 */

class annotation_handler_field_annotation_quote extends views_handler_field {
  /**
   * Do not select a non-existent "quote" column; select selectors instead.
   */
  public function query() {
    // Ensure base table is present for additional fields.
    $this->ensure_my_table();
    // Add the real DB field needed for rendering.
    $this->add_additional_fields(array('selectors'));
    // Intentionally do NOT call parent::query(), to avoid selecting annotation.quote.
  }

  public function render($values) {
    // Pull the selectors value via the additional field alias.
    $selectors = $this->get_value($values, 'selectors');
    $annotation = new stdClass();
    $annotation->selectors = isset($selectors) ? $selectors : '';
    // annotation_extract_quote() is defined in annotation.module.
    $quote = annotation_extract_quote($annotation);
    return check_plain($quote);
  }
}
