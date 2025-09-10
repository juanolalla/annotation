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
   * Render the operations as a Backdrop dropbutton.
   */
  public function render($values) {
    $aid = (int) $this->get_value($values, 'aid');
    $uid = (int) $this->get_value($values, 'uid');

    if (!$aid) {
      return '';
    }

    // Build operations as links array suitable for a dropbutton.
    $ops = array();

    // View link (always present; route enforces access separately).
    $ops['annotation_view'] = array(
      'title' => t('view'),
      'href' => 'annotation/' . $aid,
    );

    // Edit/Delete conditionally based on access helpers.
    $annotation = new stdClass();
    $annotation->aid = $aid;
    $annotation->uid = $uid;

    if (function_exists('annotation_access_edit') && annotation_access_edit($annotation)) {
      $ops['annotation_edit'] = array(
        'title' => t('edit'),
        'href' => 'annotation/' . $aid . '/edit',
        'query' => backdrop_get_destination(),
      );
    }

    if (function_exists('annotation_access_delete') && annotation_access_delete($annotation)) {
      $ops['annotation_delete'] = array(
        'title' => t('delete'),
        'href' => 'annotation/' . $aid . '/delete',
        'query' => backdrop_get_destination(),
      );
    }

    // Render as a dropbutton.
    $links = array(
      '#type' => 'dropbutton',
      '#links' => $ops,
    );

    return backdrop_render($links);
  }
}
