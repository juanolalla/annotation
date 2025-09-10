<?php
/**
 * @file
 * Views field handler to render a Delete link for an annotation when allowed.
 */

class annotation_handler_field_annotation_link_delete extends views_handler_field {
  public function query() {
    $this->ensure_my_table();
    $this->add_additional_fields(array('aid', 'uid'));
  }

  public function render($values) {
    $aid = (int) $this->get_value($values, 'aid');
    $uid = (int) $this->get_value($values, 'uid');
    if (!$aid) {
      return '';
    }
    $annotation = new stdClass();
    $annotation->aid = $aid;
    $annotation->uid = $uid;
    if (function_exists('annotation_access_delete') && annotation_access_delete($annotation)) {
      return l(t('Delete'), 'annotation/' . $aid . '/delete', array('query' => backdrop_get_destination()));
    }
    return '';
  }
}
