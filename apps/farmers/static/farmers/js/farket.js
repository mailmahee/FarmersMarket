function findMarkets() {
    if(directionsDisplay != null) {
        console.log("mulligy");
    directionsDisplay.setMap(null);
    directionsDisplay = null;
}
    for(var i = 0; i < markersArr.length; i++) {
        if(markersArr[i]) {
            markersArr[i].setMap(null);
            markersArr[i] = null;
        }
        markersArr = [];
    }
    $.get("http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + currentZip, function(response){getMarketData(response);}, "json");
    function getMarketData(response) {
        var marketArr = [];
        for(var i = 0; i < response["results"].length; i++) {
            marketArr.push(response["results"][i]["id"]);
        }
        $.get("localdata", function(response){saveData(response, marketArr);}, "json");
    }
}

function saveData(response, marketArr) {
     filteredMarkets = [];
     for(var i = 0; i < response.length; i++) {
         for(var j = 0; j < marketArr.length; j++) {
             if(response[i]["FMID"] == marketArr[j]) {
                 filteredMarkets.push(response[i]);
             }
         }
     }
     var infokeys = ["MarketName", "Season1Time", "street", "city", "State", "Website"]; //added a key for directions
     for(var x = 0; x < filteredMarkets.length; x++) {
         var content = '<div class="infowindow">';
         for(var m = 0; m < infokeys.length; m++) {
             if(filteredMarkets[x][infokeys[m]] != "") {
                 if(infokeys[m] == "Website") {
                     content += '<p><a href="'+filteredMarkets[x][infokeys[m]]+'">'+filteredMarkets[x][infokeys[m]]+'</a></p>';
                 }
                 else {
                     content += "<p>"+filteredMarkets[x][infokeys[m]]+"</p>";
                 }
             }
         }
         content += '<i id="destination"class="btn fa fa-location-arrow fa-5x" name="directions" onclick="getDirections()">Get Directions</i>';
         content += "</div>";
         coords = filteredMarkets[x].y+ "," + filteredMarkets[x].x;
         addMarkerToMap(filteredMarkets[x]["y"], filteredMarkets[x]["x"], content, coords, x);
     }
     $("#map").removeClass("loading");
 }

 function getDirections() {
     for(var i = 0; i < markersArr.length; i++) {
         if(markersArr[i] && i != mIndex) {
             markersArr[i].setMap(null);
             markersArr[i] = null;
         }
     }
     getLocation();
    //  calculateRoute(start, goTo);
     window.setTimeout(calculateRoute(start, goTo), 5000);
 }

 function calculateRoute(from, to) {
     var directionsService = new google.maps.DirectionsService();
     var directionsRequest = {
       origin: from,
       destination: to,
       travelMode: google.maps.DirectionsTravelMode.DRIVING,
       unitSystem: google.maps.UnitSystem.METRIC
     };
     directionsService.route(
       directionsRequest,
       function(response, status)
       {
         if (status == google.maps.DirectionsStatus.OK)
         {
           new google.maps.DirectionsRenderer({
             map: map,
             directions: response
           });
         }
         else
           $("#error").append("Unable to retrieve your route<br />");

       }
     );
 }

 function enterZip() {
     currentZip = $("input[name='zip']").val();
     findMarkets();
 }

var markersArr = [];
var filteredMarkets;
var infowindow;
var map;
var geocoder;
var lat;
var long;
var directionsDisplay;
var currentLocation;
var goTo;
var start;
var currentZip;
var mIndex;

function getLocation() {
    for(var i = 0; i < markersArr.length; i++) {
        if(markersArr[i]) {
            markersArr[i].setMap(null);
            markersArr[i] = null;
        }
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("map").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function myMap(position) {
    var myCenter = new google.maps.LatLng(37.3382082, -121.8863286);

    var mapCanvas = document.getElementById("map");

    var mapOptions = {
        center: myCenter,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(mapCanvas, mapOptions);
    geocoder = new google.maps.Geocoder;
    infowindow = new google.maps.InfoWindow();

}

function showPosition(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    start = lat+","+long;
 //    addMarkerToMap(lat, long);
    geocodeLatLong(geocoder, map);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById("map").innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById("map").innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            document.getElementById("map").innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById("map").innerHTML = "An unknown error occurred."
            break;
    }
}

function addMarkerToMap(lat, long, content, coords, mIndex){
    var myLatLng = new google.maps.LatLng(lat, long);
    var marker = new google.maps.Marker({
        position: myLatLng,
        zoom: 12,
        map: map,
        // animation: google.maps.Animation.DROP,
        coords: coords,
        mIndex: mIndex
    });
    markersArr.push(marker);
    map.panTo(myLatLng)

    marker.addListener("mouseover", function(){
        infowindow.setContent(content);
        infowindow.open(map, marker);
        goTo = marker.coords;
        index = marker.index;

        // console.log("current goTo is "+goTo);
    });
    // marker.addListener("click", function(){
    //     infowindow.setContent('<p><button class="directions" type="button" name="directions">Get Directions</button></p>');
    // })
    // google.maps.event.addListener(marker, "click", function(){
    //     infowindow.setContent('<p><button class="directions" type="button" name="directions">Get Directions</button></p>');
    // })



    // marker.addListener("click", function(){
    //     event.preventDefault();
    //     console.log("***********hey!");
    //     calculateRoute(currentLocation, currentaddress);
    //     console.log(currentLocation);
    //     var currentaddress= filteredMarkets[0].street+ "," + filteredMarkets[0].city+ ","+filteredMarkets[0].State+","+filteredMarkets[0].zip;
    //     console.log(currentaddress);
    // })

}

function geocodeLatLong(geocoder, map, zipcode) {
    console.log("geocodelatlong");
  var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {
          currentZip = getZipFromGeo(results);
        //   findMarkets(currentZip);
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}

function getZipFromGeo(geoResults) {
    zipRegex = /^\d{5}$/;
    for(var i = 0; i < geoResults.length; i++) {
        for(var j = geoResults[i].address_components.length - 1; j >= 0; j--) {
            if (zipRegex.test(geoResults[i].address_components[j].long_name)) {
                return geoResults[i].address_components[j].long_name;
            }
        }
    }
}
