<?php
/**
 * @file
 * Views custom field handler to render the author's username from uid.
 */

class annotation_handler_field_annotation_author extends views_handler_field {
  /**
   * Ensure needed fields are available in the query.
   */
  public function query() {
    $this->ensure_my_table();
    // We only need the uid value to render the username.
    $this->add_additional_fields(array('uid'));
    // Do not call parent::query() to avoid selecting a non-existent real field.
  }

  /**
   * Render the linked username for the provided uid.
   */
  public function render($values) {
    $uid = (int) $this->get_value($values, 'uid');
    if (!$uid) {
      return '';
    }
    $account = user_load($uid);
    if (!$account) {
      return '';
    }
    // Use the standard username theming which outputs a link to the user.
    return theme('username', array('account' => $account));
  }
}
