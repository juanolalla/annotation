<?php

class Annotation extends Entity {

  public $aid;
  public $label;
  public $body;
  public $selectors;
  public $uid; // Owner user ID
  public $user; // Deprecated; kept for backward compatibility
  public $created;
  public $url;

  public function __construct(array $values = array()) {
    parent::__construct($values, 'annotation');
  }

  public function entityType() {
    return 'annotation';
  }

  public function id() {
    return $this->aid;
  }

  public function label() {
    return $this->label;
  }

  public function uri() {
    return array(
      'path' => 'annotation/' . $this->aid,
    );
  }
}
