# Annotation Module for Backdrop CMS

This module provides annotation functionality for Backdrop CMS, allowing users to annotate content using the Annotator JavaScript library.

## Requirements

- Backdrop CMS
- CTools module
- Entity module

## Installation

1. Install this module using the official Backdrop CMS instructions at https://docs.backdropcms.org/documentation/extend-with-modules.
2. Install the required dependencies: CTools and Entity modules.
3. Go to Admin > Structure > Annotation to configure the module.

## Configuration

The module provides a configuration page at Admin > Structure > Annotation where you can manage annotation types.

## Usage

Once enabled, the module provides an API for creating, reading, updating, and deleting annotations. It also integrates with the Annotator JavaScript library to provide a user interface for annotations.

## Porting from Drupal 7

This module has been ported from Drupal 7 to Backdrop CMS. The following changes were made:

1. Updated the .info file to use Backdrop's format.
2. Updated function names from `drupal_*` to `backdrop_*`.
3. Updated JavaScript code to use `Backdrop` instead of `Drupal`.
4. Updated the variable system to use Backdrop's config system.

## Issues

Bugs and feature requests should be reported in the issue queue.

## License

This project is GPL v2 software. See the LICENSE.txt file in this directory for complete text.

## Credits

This module was originally developed for Drupal 7 and has been ported to Backdrop CMS.

## Maintainers

- Seeking maintainers.

## Development Notes

The module depends on the `AnnotatorPlugin` class, which is not defined in this module. It might be defined in a separate module that's not included in the repository, or it might be dynamically loaded through the CTools plugin system. If you encounter issues with this class, you might need to install additional modules or implement this class.
