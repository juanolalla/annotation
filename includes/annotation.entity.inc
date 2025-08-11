<?php

class Annotation extends Entity {

  public $aid;
  public $label;
  public $body;
  public $target;
  public $user;
  public $created;
  public $url;
  public $start;
  public $end;

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
