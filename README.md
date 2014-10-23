Connect Grid
====

Excel-like minimalistic grid featuring:

- keyboard navigation between cells
- columns renderer

Get started
===========
- Load angular.js and underscore.js on your page
- Load the build/build.js file on your page
- Load the styles/grid.css file on your page, or define your own styles
- Add connect-grid to your template like this:

<connect-grid ng-model="myCollection" grid-options="myGridOptions"></connect-grid>

- myCollection can be any array of js objects and must be present in scope
- myGridOptions should be a configuration object and should be present in scope
- see gridOptions doc below 

Grid options configuration object
=================================
- columnDefs (default: empty list) -- list of configuration objects for columns (see column definition configuration object below)

Column definition configuration object
======================================
- field
- displayName
- editable
- selectable
- cellClass - string or function
- cellTemplate - string template to use to render cell value (see Cell templates for more info)
- isHintVisible - function
- hintTemplateSrc - function
- valueResolver - function
     
Cell templates
==============
Be sure to have only one root element in cellTemplate option of columnsDef.
 
Methods / events
================
- "grid.start-cell-edit" event

Known issues
============
If you wrap connect-grid inside ng-if (or apply ng-if to it), the text input will lose focus every now and then when you start inline editing (related to issues with angular-animate).