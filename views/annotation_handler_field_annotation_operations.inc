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

    // Optionally limit Edit/Delete visibility to reasonable users.
    global $user;
    $may_manage = user_access('administer content') || (!empty($user->uid) && (int) $user->uid === $uid);
    if ($may_manage) {
      $links[] = l(t('Edit'), 'annotation/' . $aid . '/edit');
      $links[] = l(t('Delete'), 'annotation/' . $aid . '/delete');
    }

    return implode(' | ', $links);
  }
}
