/*!
 * TEMPLATE INSTRUCTIONS: Look for sections below marked MODIFY and adjust to fit your data and index.html page
 * Learn more at
 * Data Visualization book-in-progress by Jack Dougherty at Trinity College CT
 * http://epress.trincoll.edu/dataviz
 * and
 * Searchable Map Template with Google Fusion Tables
 * http://derekeder.com/searchable_map_template/
 *
 * Copyright 2012, Derek Eder
 * Licensed under the MIT license.
 * https://github.com/derekeder/FusionTable-Map-Template/wiki/License
 *
 * Date: 17/03/2014 template modified by Derek Eder and Jack Dougherty
 *
 */

// Enable the visual refresh
google.maps.visualRefresh = true;

var MapsLib = MapsLib || {};
var MapsLib = {

  //Setup section - put your Fusion Table details here
  //Using the v1 Fusion Tables API. See https://developers.google.com/fusiontables/docs/v1/migration_guide for more info

  //MODIFY the encrypted Table IDs of your Fusion Tables (found under File => About)
  //NOTE: numeric IDs will be depricated soon
  fusionTableId:      "1WoxNIvjGQzQAk7B965hwVQOIl04f-Xn09JuTLu03", //Point data layer
  
  polygon1TableID:    "1poRWt7WIHrERFaMu0gmdtN-yVBjXxzE4VG8I4sM", //HPS zones
  polygon2TableID:    "1ceippR4giBiF-pT9PE1YAUvebFp6_NKvYriccYo", //CT town boundaries outlines

  //*MODIFY Fusion Tables Requirement* API key. found at https://code.google.com/apis/console/
  //*Important* this key is for demonstration purposes. please register your own.
  googleApiKey:       "AIzaSyDIevSvpV-ONb4Pf15VUtwyr_zZa7ccwq4",

  //MODIFY name of the location column in your Fusion Table.
  //NOTE: if your location column name has spaces in it, surround it with single quotes
  //example: locationColumn:     "'my location'",
  //if your Fusion Table has two-column lat/lng data, see https://support.google.com/fusiontables/answer/175922
  locationColumn:     "Lat",

  map_centroid:       new google.maps.LatLng(41.7682,-72.684), //center that your map defaults to
  locationScope:      "connecticut",      //geographical area appended to all address searches
  recordName:         "result",       //for showing number of results
  recordNamePlural:   "results",

  searchRadius:       805,            //in meters ~ 1/2 mile
  defaultZoom:        13,             //zoom level when map is loaded (bigger is more zoomed in)
  addrMarkerImage:    'images/blue-pushpin.png',
  currentPinpoint:    null,

  initialize: function() {
    $( "#result_count" ).html("");

    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: MapsLib.defaultZoom,
      center: MapsLib.map_centroid,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          stylers: [
            { saturation: -100 }, // MODIFY Saturation and Lightness if needed
            { lightness: 40 }     // Current values make thematic polygon shading stand out over base map
          ]
        }
      ]
    };
    map = new google.maps.Map($("#map_canvas")[0],myOptions);

    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        MapsLib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(MapsLib.map_centroid);
    });

    MapsLib.searchrecords = null;

    // MODIFY if needed: defines background polygon1 and polygon2 layers
    MapsLib.polygon1 = new google.maps.FusionTablesLayer({
      query: {
        from:   MapsLib.polygon1TableID,
        select: "geometry"
      },
      styleId: 2,
      templateId: 2
    });

    MapsLib.polygon2 = new google.maps.FusionTablesLayer({
      query: {
        from:   MapsLib.polygon2TableID,
        select: "geometry"
      },
      styleId: 2,
      templateId: 2
    });

    //reset filters
    $("#search_address").val(MapsLib.convertToPlainString($.address.parameter('address')));
    var loadRadius = MapsLib.convertToPlainString($.address.parameter('radius'));
    if (loadRadius != "") $("#search_radius").val(loadRadius);
    else $("#search_radius").val(MapsLib.searchRadius);
    $(":checkbox").prop("checked", "checked");
    $("#result_box").hide();

    //-----custom initializers -- default setting to display Polygon1 layer

    $("#rbPolygon1").attr("checked", "checked");

    //-----end of custom initializers-------

    //run the default search
    MapsLib.doSearch();
  },

  doSearch: function(location) {
    MapsLib.clearSearch();

    // MODIFY if needed: shows background polygon layer depending on which checkbox is selected
    if ($("#rbPolygon1").is(':checked')) {
      MapsLib.polygon1.setMap(map);
    }
    else if ($("#rbPolygon2").is(':checked')) {
      MapsLib.polygon2.setMap(map);
    }

    var address = $("#search_address").val();
    MapsLib.searchRadius = $("#search_radius").val();

    var whereClause = MapsLib.locationColumn + " not equal to ''";

  //-----custom filters for point data layer
    //---MODIFY column header and values below to match your Google Fusion Table AND index.html
    //-- TEXTUAL OPTION to display legend and filter by non-numerical data in your table
    var type_column = "'Program Type'";  // -- note use of single & double quotes for two-word column header
    var tempWhereClause = [];
    if ( $("#cbType1").is(':checked')) tempWhereClause.push("Interdistrict");
    if ( $("#cbType2").is(':checked')) tempWhereClause.push("District");
    if ( $("#cbType3").is(':checked')) tempWhereClause.push("MorePreK");
    whereClause += " AND " + type_column + " IN ('" + tempWhereClause.join("','") + "')";

    //-- NUMERICAL OPTION - to display and filter a column of numerical data in your table, use this instead
    /*    var type_column = "'TypeNum'";
    var searchType = type_column + " IN (-1,";
    if ( $("#cbType1").is(':checked')) searchType += "1,";
    if ( $("#cbType2").is(':checked')) searchType += "2,";
    if ( $("#cbType3").is(':checked')) searchType += "3,";
    if ( $("#cbType4").is(':checked')) searchType += "4,";
    if ( $("#cbType5").is(':checked')) searchType += "5,";
    whereClause += " AND " + searchType.slice(0, searchType.length - 1) + ")";*/
    //-------end of custom filters--------

    if (address != "") {
      if (address.toLowerCase().indexOf(MapsLib.locationScope) == -1)
        address = address + " " + MapsLib.locationScope;

      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          MapsLib.currentPinpoint = results[0].geometry.location;

          $.address.parameter('address', encodeURIComponent(address));
          $.address.parameter('radius', encodeURIComponent(MapsLib.searchRadius));
          map.setCenter(MapsLib.currentPinpoint);
          map.setZoom(14);

          MapsLib.addrMarker = new google.maps.Marker({
            position: MapsLib.currentPinpoint,
            map: map,
            icon: MapsLib.addrMarkerImage,
            animation: google.maps.Animation.DROP,
            title:address
          });

          whereClause += " AND ST_INTERSECTS(" + MapsLib.locationColumn + ", CIRCLE(LATLNG" + MapsLib.currentPinpoint.toString() + "," + MapsLib.searchRadius + "))";

          MapsLib.drawSearchRadiusCircle(MapsLib.currentPinpoint);
          MapsLib.submitSearch(whereClause, map, MapsLib.currentPinpoint);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else { //search without geocoding callback
      MapsLib.submitSearch(whereClause, map);
    }
  },

  submitSearch: function(whereClause, map, location) {
    //get using all filters
    //NOTE: styleId and templateId are recently added attributes to load custom marker styles and info windows
    //you can find your Ids inside the link generated by the 'Publish' option in Fusion Tables
    //for more details, see https://developers.google.com/fusiontables/docs/v1/using#WorkingStyles

    MapsLib.searchrecords = new google.maps.FusionTablesLayer({
      query: {
        from:   MapsLib.fusionTableId,
        select: MapsLib.locationColumn,
        where:  whereClause
      },
      styleId: 2,
      templateId: 2
    });
    MapsLib.searchrecords.setMap(map);
    MapsLib.getCount(whereClause);
    MapsLib.getList(whereClause);
  },
  // MODIFY if you change the number of Polygon layers
  clearSearch: function() {
    if (MapsLib.searchrecords != null)
      MapsLib.searchrecords.setMap(null);
    if (MapsLib.polygon1 != null)
      MapsLib.polygon1.setMap(null);
    if (MapsLib.polygon2 != null)
      MapsLib.polygon2.setMap(null);
    if (MapsLib.addrMarker != null)
      MapsLib.addrMarker.setMap(null);
    if (MapsLib.searchRadiusCircle != null)
      MapsLib.searchRadiusCircle.setMap(null);
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var foundLocation;

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        foundLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        MapsLib.addrFromLatLng(foundLocation);
      }, null);
    }
    else {
      alert("Sorry, we could not find your location.");
    }
  },

  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search_address').val(results[1].formatted_address);
          $('.hint').focus();
          MapsLib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  drawSearchRadiusCircle: function(point) {
      var circleOptions = {
        strokeColor: "#4b58a6",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: "#4b58a6",
        fillOpacity: 0.05,
        map: map,
        center: point,
        clickable: false,
        zIndex: -1,
        radius: parseInt(MapsLib.searchRadius)
      };
      MapsLib.searchRadiusCircle = new google.maps.Circle(circleOptions);
  },

  query: function(selectColumns, whereClause, groupBY, orderBY, limit, callback) {
    var queryStr = [];
    queryStr.push("SELECT " + selectColumns);
    queryStr.push(" FROM " + MapsLib.fusionTableId);

    if (whereClause != "")
      queryStr.push(" WHERE " + whereClause);

    if (groupBY != "")
      queryStr.push(" GROUP BY " + groupBY);

    if (orderBY != "")
      queryStr.push(" ORDER BY " + orderBY);

     if (limit != "")
      queryStr.push(" LIMIT " + limit);

    var sql = encodeURIComponent(queryStr.join(" "));
    // console.log(sql)
    $.ajax({url: "https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&callback="+callback+"&key="+MapsLib.googleApiKey, dataType: "jsonp"});
  },

  handleError: function(json) {
    if (json["error"] != undefined) {
      var error = json["error"]["errors"]
      console.log("Error in Fusion Table call!");
      for (var row in error) {
        console.log(" Domain: " + error[row]["domain"]);
        console.log(" Reason: " + error[row]["reason"]);
        console.log(" Message: " + error[row]["message"]);
      }
    }
  },

  getCount: function(whereClause) {
    var selectColumns = "Count()";
    MapsLib.query(selectColumns, whereClause,"", "", "", "MapsLib.displaySearchCount");
  },

  displaySearchCount: function(json) {
    MapsLib.handleError(json);
    var numRows = 0;
    if (json["rows"] != null)
      numRows = json["rows"][0];

    var name = MapsLib.recordNamePlural;
    if (numRows == 1)
    name = MapsLib.recordName;
    $( "#result_box" ).fadeOut(function() {
        $( "#result_count" ).html(MapsLib.addCommas(numRows) + " " + name + " found");
      });
    $( "#result_box" ).fadeIn();
  },

  getList: function(whereClause) {
    // select specific columns from the fusion table to display in th list
    // NOTE: we'll be referencing these by their index (0 = School, 1 = GradeLevels, etc), so order matters!
    var selectColumns = "School, GradeLevels, Address, City, State, Url, Manager, Gain_numeric, Gain_image";
    MapsLib.query(selectColumns, whereClause,"", "", 500, "MapsLib.displayList");
  },

  displayList: function(json) {
    MapsLib.handleError(json);
    var columns = json["columns"];
    var rows = json["rows"];
    var template = "";

    var results = $("#listview");
    results.empty(); //hide the existing list and empty it out first

    if (rows == null) {
      //clear results list
      results.append("<span class='lead'>No results found</span>");
      }
    else {

      //set table headers
      var list_table = "\
      <table class='table' id ='list_table'>\
        <thead>\
          <tr>\
            <th>School</th>\
            <th>Grades&nbsp;&nbsp;</th>\
            <th>Address</th>\
            <th>Manager</th>\
            <th>Gain</th>\
          </tr>\
        </thead>\
        <tbody>";

      // based on the columns we selected in getList()
      // rows[row][0] = School
      // rows[row][1] = GradeLevels
      // rows[row][2] = Address
      // rows[row][3] = City
      // rows[row][4] = State
      // rows[row][5] = Url
      // rows[row][6] = Manager
      // rows[row][7] = Gain_numeric
      // rows[row][8] = Gain_image

      for (var row in rows) {

        var school = "<a href='" + rows[row][5] + "'>" + rows[row][0] + "</a>";
        var address = rows[row][2] + "<br />" + rows[row][3] + ", " + rows[row][4];

        list_table += "\
          <tr>\
            <td>" + school + "</td>\
            <td>" + rows[row][1] + "</td>\
            <td>" + address + "</td>\
            <td>" + rows[row][6] + "</td>\
            <td><span data-value='" + rows[row][7] + "'><img src='" + rows[row][8] + "' /></span></td>\
          </tr>";
      }

      list_table += "\
          </tbody>\
        </table>";

      // add the table to the page
      results.append(list_table);

      // init datatable
      // once we have our table put together and added to the page, we need to initialize DataTables
      // reference: http://datatables.net/examples/index

      // custom sorting functions defined in js/jquery.dataTables.sorting.js
      // custom Bootstrap styles for pagination defined in css/dataTables.bootstrap.css

      $("#list_table").dataTable({
          "aaSorting": [[0, "asc"]], //default column to sort by (School)
          "aoColumns": [ // tells DataTables how to perform sorting for each column
              { "sType": "html-string" }, //School name with HTML for the link, which we want to ignore
              null, // Grades - default text sorting
              null, // Address - default text sorting
              null, // Manager - default text sorting
              { "sType": "data-value-num" } // Gain - sort by a hidden data-value attribute
          ],
          "bFilter": false, // disable search box since we already have our own
          "bInfo": false, // disables results count - we already do this too
          "bPaginate": true, // enables pagination
          "sPaginationType": "bootstrap", // custom CSS for pagination in Bootstrap
          "bAutoWidth": false
      });
    }
   },


  addCommas: function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },

  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  },

  //converts a slug or query string in to readable text
  convertToPlainString: function(text) {
    if (text == undefined) return '';
  	return decodeURIComponent(text);
  }

  //-----custom functions-------
  // NOTE: if you add custom functions, make sure to append each one with a comma, except for the last one.
  // This also applies to the convertToPlainString function above

  //-----end of custom functions-------
}
