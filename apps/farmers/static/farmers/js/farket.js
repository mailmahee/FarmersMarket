function findMarkets(zip) {
    $.get("http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zip, function(response){getMarketData(response);}, "json");
    function getMarketData(response) {
        marketArr = [];
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
     var infokeys = ["MarketName", "Season1Time", "street", "city", "State", "Website"];
     for(var x = 0; x < filteredMarkets.length; x++) {
         // console.log(filteredMarkets[x]);
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
         content += "</div>";
         addMarkerToMap(filteredMarkets[x]["y"], filteredMarkets[x]["x"], content);
     }
 }

 function enterZip() {
     var zip = $("input[name='zip']").val();
     findMarkets(zip);
 }

var infowindow;
var map;
var geocoder;
var lat;
var long;
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById("map").innerHTML = "Geolocation is not supported by this browser.";
    }
}

function myMap(position) {
    var myCenter = new google.maps.LatLng(37.3382082, -121.8863286);
    var mapCanvas = document.getElementById("map");
    var mapOptions = {center: myCenter, zoom: 12};
    map = new google.maps.Map(mapCanvas, mapOptions);
 //    var marker = new google.maps.Marker({position:myCenter});
 //    marker.setMap(map);
    geocoder = new google.maps.Geocoder;
    infowindow = new google.maps.InfoWindow();
}

function showPosition(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
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

function addMarkerToMap(lat, long, content){
    var myLatLng = new google.maps.LatLng(lat, long);
    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        animation: google.maps.Animation.DROP,
    });
    map.panTo(myLatLng)

    marker.addListener("mouseover", function(){
        infowindow.setContent(content);
        infowindow.open(map, marker);
    })
}

function geocodeLatLong(geocoder, map, zipcode) {
  var latlng = {lat: parseFloat(lat), lng: parseFloat(long)};
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[1]) {
          currentZip = getZipFromGeo(results);
         //  var currentZip = results[1].address_components[7].long_name;
          findMarkets(currentZip);
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
