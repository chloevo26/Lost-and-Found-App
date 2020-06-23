"use strict";

document.getElementById("logo").addEventListener("click", () => {
  window.location = "/views/screen2.html";
});

//GOOGLE map
var google;
var map, marker;
var coords, infowindow;
var geocoder;

var script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyApU7QqFx2zJGCQ-6cc-LCZXw6K4os93mo&callback=initMap";
script.defer = true;
script.async = true;
document.head.appendChild(script);

// find GPS location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      coords = pos.coords;
      console.log(pos);
    });
  }
}

function search() {
  let input = document.getElementById("search-input").value;
  let url = "/searchAddress?input=" + input + ",Davis";

  fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      if (data.candidates.length > 0) {
        let address = data.candidates[0].formatted_address;
        let location = data.candidates[0].geometry.location;
        let name = data.candidates[0].name;

        document.getElementById("search-input").value = name + ", " + address;

        marker.setPosition(location);
        marker.setMap(map);
        map.setCenter(location);
      }
    });
}

function initMap() {
  var mapProp = {
    center: new google.maps.LatLng(38.5367859, -121.7553711),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // INIT MAP
  map = new google.maps.Map(document.getElementById("map"), mapProp);

  marker = new google.maps.Marker();
  marker.setMap(map);

  // Click on Map
  geocoder = new google.maps.Geocoder();

  map.addListener("click", function (e) {
    clickMapPlaceMarker(e.latLng, map);
  });

  function clickMapPlaceMarker(location, map) {
    marker.setPosition(location);
    marker.setMap(map);
    map.setCenter(location);
    geocodePosition(marker.getPosition());
  }

  function geocodePosition(pos) {
    geocoder.geocode(
      {
        latLng: pos
      },
      function (responses) {
        if (responses && responses.length > 0) {
          //let address = responses[0].formatted_address;
          //let name = responses[0].name;
          document.getElementById("search-input").value =
            responses[0].formatted_address;
        } else {
          console.log("Cannot determine address at this location.");
        }
      }
    );
  }
}

document.getElementById("submit-search").addEventListener("click", () => {
  let start1 = document.getElementById("start1").value;
  let start2 = document.getElementById("start2").value;
  let appt1 = document.getElementById("appt1").value;
  let appt2 = document.getElementById("appt2").value;
  let category = document.getElementById("category-name").value;
  let loc = document.getElementById("search-input").value;
  let anotherInput = document.getElementById("another-search-input").value;
  if (
    anotherInput.trim().length == 0 &&
    start1.trim().length == 0 &&
    start2.trim().length == 0 &&
    appt1.trim().length == 0 &&
    appt2.trim().length == 0 &&
    category.trim().length == 0 &&
    loc.trim().length == 0
  )
    alert("Please fill all required fields!");
  else {
    const searchData = {
      startDate: start1,
      endDate: start2,
      startTime: appt1,
      endTime: appt2,
      category: category,
      location: loc,
      anotherInput: anotherInput,
      lostFound: "Found"
    };
    window.sessionStorage.setItem('data', JSON.stringify(searchData));
    window.location = "/views/screen10.html"
  }
});

