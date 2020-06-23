"use strict"

document.getElementById("next-btn").addEventListener("click", ()=> {
    const params = {
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        description: document.getElementById("description").value,
        imageUrl: document.getElementById("imgUpload").src
    }
    console.log(params)
    sessionStorage.setItem('foundData', JSON.stringify(params));
    window.location = '/views/screen4.html';
});

document.querySelector('#imgUpload').addEventListener('change', () => {
    // get the file with the file dialog box
    const selectedFile = document.querySelector('#imgUpload').files[0];
    // store it in a FormData object
    const formData = new FormData();
    formData.append('newImage', selectedFile, selectedFile.name);

    // build an HTTP request data structure
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);
    xhr.onloadend = function (e) {
        console.log(xhr.responseText);
        document.getElementById("imgUpload").src = "http://ecs162.org:3000/images/" + xhr.responseText;
    }
    xhr.send(formData);
});


document.getElementById("search").addEventListener("click", () => {
    window.location = '/views/screen5.html';
});

document.getElementById("logo").addEventListener("click", () => {
    window.location = '/views/screen2.html';
});

