school-search-tool
==================

The School School Tool template is a mobile-friendly interactive map with sortable results drawn from a Google Fusion Table. Anyone may fork, clone, or download this open-source code and modify to create their own version, using free web tools and following instructions below to link your Google Fusion Table and tweak some HTML/CSS/JavaScript code. Based on Searchable Map Template with Google Fusion Tables by Derek Eder http://derekeder.com/searchable_map_template/, and modified by DataViz at Trinity College, Hartford CT http://commons.trincoll.edu/dataviz. 

Learn about this web technology in Data Visualization open-access book-in-progress by Jack Dougherty at Trinity College CT
http://epress.trincoll.edu/dataviz

Learn about background of this tool at Cities Suburbs and Schools Project, SmartChoices and School Search Tool page
http://commons.trincoll.edu/cssp/smartchoices

##Demos 
See publicly-funded education options available to residents of City of Hartford, CT

hosted on GitHub Pages
https://jackdougherty.github.io/school-search-tool 

hosted on a standalone WordPress.org site
http://jacktest1.trinfocafe.org/map/

see related versions of FusionTable-Map (with toggle between map/table display; dynamic legends, etc.)
https://github.com/JackDougherty?tab=repositories

##Create your own with this template:

Use this template if you wish to create a Search-and-Filter map that turns on/off at least 2 layers (points and polygons), displays results in a sortable list, and draws data from Google Fusion Tables. The default point map displays a textual legend (A, B, C), with option to switch to numeric (0-100) values. Also, thematic polygon layers may be turned on/off in the background. 

1) Use Google Fusion Tables to create your point layer (all types in one table), and set the feature styles (set ranges, colors, etc.) and info windows.

2) Use Google Fusion Tables to create your polygon layers (each layer in its own table), and set feature styles (thematic shading, etc.) and info windows

3) Make your own copy of this template: either Fork to your own GitHub account, or Clone to Desktop, or Download a ZIP compressed version to your desktop.

4) Modify two files, following instructions in the code comments, to match your Google Fusion Tables:

- index.html 
- maps_lib.js (located inside the js folder)

Carefully read comments to display table results (To Do)

5) Host everything on the web (such as a GitHub repository gh-pages branch)

See more details in Data Visualization open-access book-in-progress by Jack Dougherty at Trinity College CT
http://epress.trincoll.edu/dataviz
