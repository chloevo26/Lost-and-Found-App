"use strict";

document.querySelector(".finder-btn").addEventListener("click", () => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/finder", true);
  xhr.onload = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log(window.location.href);
      window.location = "/views/screen3.html";
    }
  };
  xhr.send();
});

document.querySelector(".seeker-btn").addEventListener("click", () => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/seeker", true);
  xhr.onload = function() {
    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
      console.log(window.location.href);
      window.location = "/views/screen6.html";
    }
  };
  xhr.send();
});

