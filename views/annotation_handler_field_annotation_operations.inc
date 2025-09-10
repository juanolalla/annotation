<?php
/**
 * @file
 * Views field handler to render Operations links (View, Edit, Delete) for annotations.
 */

class annotation_handler_field_annotation_operations extends views_handler_field {
  /**
   * Ensure needed fields are available in the query.
   */
  public function query() {
    $this->ensure_my_table();
    // We need the annotation id for building links, and uid for simple access check.
    $this->add_additional_fields(array('aid', 'uid'));
    // Do not select a non-existent real field for this handler.
  }

  /**
   * Render the operations as internal links.
   */
  public function render($values) {
    $aid = (int) $this->get_value($values, 'aid');
    $uid = (int) $this->get_value($values, 'uid');

    if (!$aid) {
      return '';
    }

    $links = array();

    // Always show View link; access will be enforced by the route as well.
    $links[] = l(t('View'), 'annotation/' . $aid);

    // Show Edit/Delete based on annotation access helpers (administer annotations or edit own).
    $annotation = new stdClass();
    $annotation->aid = $aid;
    $annotation->uid = $uid;
    if (function_exists('annotation_access_edit') && annotation_access_edit($annotation)) {
      $links[] = l(t('Edit'), 'annotation/' . $aid . '/edit', array('query' => backdrop_get_destination()));
    }
    if (function_exists('annotation_access_delete') && annotation_access_delete($annotation)) {
      $links[] = l(t('Delete'), 'annotation/' . $aid . '/delete');
    }

    return implode(' | ', $links);
  }
}
