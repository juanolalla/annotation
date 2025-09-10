<?php
/**
 * @file
 * Views field handler to render a View link for an annotation.
 */

class annotation_handler_field_annotation_link_view extends views_handler_field {
  public function query() {
    $this->ensure_my_table();
    $this->add_additional_fields(array('aid'));
  }

  public function render($values) {
    $aid = (int) $this->get_value($values, 'aid');
    if (!$aid) {
      return '';
    }
    return l(t('View'), 'annotation/' . $aid);
  }
}
