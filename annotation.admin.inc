<?php

/**
 * @file
 * Admin settings for the Annotation module.
 */

/**
 * Settings form: admin/config/content/annotation
 */
function annotation_admin_settings_form($form, &$form_state) {
  $config = config('annotation.settings');
  $default_selector = $config->get('selector');
  if (!$default_selector) {
    $default_selector = '.node';
  }

  $form['recogito_selector'] = array(
    '#type' => 'textfield',
    '#title' => t('Recogito content selector'),
    '#default_value' => $default_selector,
    '#description' => t('Enter a CSS selector for the element Recogito should attach to (e.g. .node).'),
    '#required' => TRUE,
    '#maxlength' => 255,
  );

  $form['#submit'][] = 'annotation_admin_settings_form_submit';

  return system_settings_form($form);
}

/**
 * Submit handler for annotation_admin_settings_form.
 */
function annotation_admin_settings_form_submit($form, &$form_state) {
  // Use a dedicated configuration object to persist settings.
  $config = config('annotation.settings');
  $selector = trim($form_state['values']['recogito_selector']);
  if ($selector === '') {
    $selector = '.node';
  }
  $config->set('selector', $selector);
  $config->save();

  backdrop_set_message(t('Recogito selector has been saved.'));
}
