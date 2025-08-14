<?php
/**
 * @file
 * Views integration for the Annotation module.
 */

/**
 * Implements hook_views_data().
 */
function annotation_views_data() {
  $data = array();

  // Table group.
  $data['annotation']['table']['group'] = t('Annotation');

  // Base table so a view can be created directly on annotations.
  $data['annotation']['table']['base'] = array(
    'field' => 'aid',
    'title' => t('Annotations'),
    'help' => t('Listings of annotations.'),
    'weight' => 10,
  );

  // Join to users table on uid.
  $data['users']['table']['join']['annotation'] = array(
    'left_field' => 'uid',
    'field' => 'uid',
  );

  // Fields.
  $data['annotation']['aid'] = array(
    'title' => t('Annotation ID'),
    'help' => t('The internal ID of the annotation.'),
    'field' => array(
      'handler' => 'views_handler_field',
      'click sortable' => TRUE,
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_numeric',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
    'argument' => array(
      'handler' => 'views_handler_argument_numeric',
    ),
  );

  $data['annotation']['body'] = array(
    'title' => t('Annotation text'),
    'help' => t('The text/body of the annotation.'),
    'field' => array(
      'handler' => 'views_handler_field',
      'click sortable' => TRUE,
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_string',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
  );

  $data['annotation']['url'] = array(
    'title' => t('URI'),
    'help' => t('The page URL where the annotation was created.'),
    'field' => array(
      'handler' => 'views_handler_field_url',
      'click sortable' => TRUE,
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_string',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
    'argument' => array(
      'handler' => 'views_handler_argument_string',
    ),
  );

  $data['annotation']['uid'] = array(
    'title' => t('Author'),
    'help' => t('User who created the annotation.'),
    'field' => array(
      'handler' => 'views_handler_field_user',
      'click sortable' => TRUE,
    ),
    'argument' => array(
      'handler' => 'views_handler_argument_user_uid',
      'name field' => 'name',
    ),
    'filter' => array(
      'title' => t('Name'),
      'handler' => 'views_handler_filter_user_name',
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
    'relationship' => array(
      'handler' => 'views_handler_relationship',
      'base' => 'users',
      'base field' => 'uid',
      'label' => t('user'),
    ),
  );

  $data['annotation']['created'] = array(
    'title' => t('Updated'),
    'help' => t('The date/time the annotation was created.'),
    'field' => array(
      'handler' => 'views_handler_field_date',
      'click sortable' => TRUE,
    ),
    'sort' => array(
      'handler' => 'views_handler_sort',
    ),
    'filter' => array(
      'handler' => 'views_handler_filter_date',
    ),
  );

  // Expose selectors raw if needed; mainly for custom handler reference.
  $data['annotation']['selectors'] = array(
    'title' => t('Selectors (raw JSON)'),
    'help' => t('Raw JSON of Web Annotation selectors.'),
    'field' => array(
      'handler' => 'views_handler_field',
    ),
  );

  // Computed Quote field using custom handler.
  $data['annotation']['quote'] = array(
    'title' => t('Quote'),
    'help' => t('The quoted text from selectors.'),
    'field' => array(
      'handler' => 'annotation_handler_field_annotation_quote',
    ),
  );

  // Operations links field.
  $data['annotation']['operations'] = array(
    'title' => t('Operations'),
    'help' => t('Links to view, edit, and delete the annotation.'),
    'field' => array(
      'handler' => 'annotation_handler_field_annotation_operations',
    ),
  );

  // Author (username) field that renders the account name from uid.
  $data['annotation']['author'] = array(
    'title' => t('Author'),
    'help' => t('The account name of the annotation author.'),
    'field' => array(
      'handler' => 'annotation_handler_field_annotation_author',
      'click sortable' => TRUE,
    ),
  );

  return $data;
}
