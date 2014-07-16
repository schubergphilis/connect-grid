Grid
====

Excel-like minimalistic grid featuring:

- keyboard navigation between cells
- columns renderer

Build
=====
To build a new file run:

    $ browserify bundle.js -o build/bundled.js
     
Cell templates
==============
Be sure to have only one root element in cellTemplate option of columnsDef. 

Known issues
============
If you wrap connect-grid inside ng-if (or apply ng-if to it), the text input will lose focus every now and then when you start inline editing.