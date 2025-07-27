<?php

/**
 * @file
 * Annotation controller.
 */

/**
 * Annotation entity api controller class.
 */
class AnnotationAPIController extends EntityAPIController {

  /**
   * AnnotationAPIController constructor.
   */
  public function __construct($entityType) {
    parent::__construct($entityType);
  }

  /**
   * {@inheritdoc}
   */
  public function load($ids = array(), $conditions = array()) {
    $entities = parent::load($ids, $conditions);
    foreach ($entities as $id => $entity) {
      $op = 'load';
      backdrop_alter('annotation', $entity, $op);
      $entities[$id] = $entity;
    }
    return $entities;
  }

  /**
   * {@inheritdoc}
   */
  public function save($entity, DatabaseTransaction $transaction = NULL) {
    $op = 'save';
    backdrop_alter('annotation', $entity, $op);
    parent::save($entity, $transaction);
  }

  /**
   * {@inheritdoc}
   */
  public function buildContent($entity, $view_mode = 'full', $langcode = NULL, $content = array()) {
    $content['quote'] = array(
      '#theme' => 'field',
      '#weight' => 0,
      '#title' => t('Quote'),
      '#access' => TRUE,
      '#label_display' => 'above',
      '#view_mode' => 'full',
      '#language' => LANGUAGE_NONE,
      '#field_name' => 'field_fake_quote',
      '#field_type' => 'text',
      '#entity_type' => 'annotation',
      '#bundle' => $entity->type,
      '#items' => array(
        array(
          'value' => $entity->quote,
        ),
      ),
      '#formatter' => 'text_default',
      0 => array(
        '#markup' => '<blockquote cite="' . check_plain($entity->uri) . '">' . check_plain($entity->quote) . '</blockquote>',
      ),
    );
    $content['text'] = array(
      '#theme' => 'field',
      '#weight' => 0,
      '#title' => t('Annotation'),
      '#access' => TRUE,
      '#label_display' => 'above',
      '#view_mode' => 'full',
      '#language' => LANGUAGE_NONE,
      '#field_name' => 'field_fake_text',
      '#field_type' => 'text',
      '#entity_type' => 'annotation',
      '#bundle' => $entity->type,
      '#items' => array(
        array('value' => $entity->text),
      ),
      '#formatter' => 'text_default',
      0 => array(
        '#markup' => check_plain($entity->text),
      ),
    );
    $content['#view_mode'] = $view_mode;
    return parent::buildContent($entity, $view_mode, $langcode, $content);
  }

}

/**
 * {@inheritdoc}
 */
function get_properties($obj, $values = FALSE) {
  $obj_dump  = print_r($obj, 1);
  $matches = array();
  preg_match_all('/^\s+\[(\w+).*\] => (\w*)/m', $obj_dump, $matches);
  if ($values) {
    $output = array();
    foreach ($matches[1] as $key => $property) {
      $output[$property] = $matches[2][$key];
    }
    return $output;
  }
  else {
    return $matches[1];
  }

}
