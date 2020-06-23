"use strict";

document
  .getElementById("submit-btn")
  .addEventListener("click", sendUpdatedLostData);

function sendUpdatedLostData() {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/lostData", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  let data = JSON.parse(sessionStorage.getItem("lostData"));
  sessionStorage.clear(); // clear session storage
  console.log("Data from screen 6", data);
  const params = {
    title: data.title,
    category: data.category,
    description: data.description,
    imageUrl: data.imageUrl,
    date: document.getElementById("start").value,
    time: document.getElementById("appt").value,
    location:document.getElementById("search-input").value
  };
  console.log(params);
  xhr.onload = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log(xhr.responseText);
      window.location = "/views/screen2.html";
    }
  };
  xhr.send(JSON.stringify(params));
}

document.getElementById("search").addEventListener("click", () => {
  window.location = "/views/screen8.html";
});
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

  map.addListener("click", function(e) {
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
      function(responses) {
        if (responses && responses.length > 0) {
          //let address = responses[0].formatted_address;
          //let name = responses[0].name;
          document.getElementById("search-input").value = responses[0].formatted_address;
        } else {
          console.log("Cannot determine address at this location.");
        }
      }
    );
  }
}

