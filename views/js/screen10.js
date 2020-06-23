"use strict";

getData();

document.getElementById("logo").addEventListener("click", () => {
    window.location = "/views/screen2.html";
});

document.getElementById("edit-search").addEventListener("click", () => {
    window.location = "/views/screen8.html";
});

function getData() {
    let data = window.sessionStorage.getItem("data");
    console.log(data);
    //   window.sessionStorage.clear();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/searchDb");
    xhr.setRequestHeader("Content-Type", "application/json");
    console.log("Screen 9 sends post request");
    xhr.onload = function () {
        console.log("Page 9 response");
        console.log(this.response);
        let searchData = window.sessionStorage.getItem("data");
        displaySearch(searchData);
        // display data on screen 9
        let data = JSON.parse(this.response);
        // let dataLength = data.length;
        //createResultRows(len);
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];
            // console.log(obj.location);
            createObj(obj, i);
        }
    };
    xhr.send(data);
}

function displaySearch(searchData) {

    let data = JSON.parse(searchData);
    if (data.startDate) {
        let startDate = data.startDate.split("-");
        console.log(startDate)
        data.startDate = findMonth(startDate[1]) + " " + findDay(startDate[2]) + ", " + startDate[0];
    }
    if (data.endDate) {
        let endDate = data.endDate.split("-");
        console.log(endDate)
        data.endDate = findMonth(endDate[1]) + " " + findDay(endDate[2]) + ", " + endDate[0];
    }
    console.log(data)
    let value = Object.values(data)
    console.log(value)
    let displayStr = "";
    let date = "";
    if (data.startDate && data.endDate) {
        date += data.startDate + " " + data.startTime + "- " + data.endDate + " " + data.endTime;
        delete data.startDate;
        delete data.startTime;
        delete data.endDate;
        delete data.endTime;
    }
    console.log(data)
    if (date) {
        displayStr += date
    }
    value = Object.values(data)
    for (var i = 0; i < value.length; i++) {
        if (value[i] && value[i] != 'Lost' && value[i] != 'Found') {
            if (displayStr) {
                displayStr = displayStr + ", " + value[i];
            } else {
                displayStr = displayStr + " " + value[i];
            }

        }
    }
    console.log(displayStr)
    document.getElementById("searchInfo").textContent = displayStr;
}

function findMonth(str) {
    var dic = {
        "01": "Jan",
        "02": "Feb",
        "03": "Mar",
        "04": "April",
        "05": "May",
        "06": "June",
        "07": "July",
        "08": "August",
        "09": "Sept",
        "10": "Oct",
        "11": "Nov",
        "12": "Dec"
    }
    // console.log(dic[str])
    return dic[str]
}
function findDay(str) {
    var dic = {
        "01": "1st",
        "02": "2nd",
        "03": "3rd",
        "04": "4th",
        "05": "5th",
        "06": "6th",
        "07": "7th",
        "08": "8th",
        "09": "9th",
        "31": "31st"
    }
    if (dic[str]) {
        return dic[str]
    } else {
        return str + "th"
    }
}

// A function that creates a result div, a btn, and a detail div for each json obj
function createObj(data, idx) {
    console.log(data)
    var result_idx = "result" + idx;
    var detail_idx = "detail" + idx;
    var moreBtn_idx = "moreButton" + idx;
    var title_idx = "tile" + idx

    // first, create instances for each obj
    let result = document.createElement("div");
    result.className = "results";
    result.setAttribute("id", result_idx);
    // result.textContent = data.title;
    //result.setAttribute("class", "results");
    document.getElementById("resultContainer").appendChild(result);

    let title = document.createElement("p");
    title.setAttribute("id", title_idx);
    title.setAttribute("class", "titles");
    title.textContent = data.title;
    document.getElementById(result_idx).appendChild(title);

    let moreBtn = document.createElement("button");
    moreBtn.setAttribute("id", moreBtn_idx);
    moreBtn.setAttribute("class", "MoreButtons");
    moreBtn.textContent = "More";
    document.getElementById(title_idx).appendChild(moreBtn);

    let detail = document.createElement("div");
    detail.setAttribute("id", detail_idx);
    detail.setAttribute("class", "details");
    detail.style.display = "none";
    document.getElementById(result_idx).appendChild(detail);

    // then, add onclick event for each "More" button
    let detailInfo = document.getElementById(detail_idx);
    let moreButtonInfo = document.getElementById(moreBtn_idx);
    moreBtn.onclick = function () {
        // Note this is a function
        if (detailInfo.style.display === "none") {
            detailInfo.style.display = "flex";
            moreBtn.removeAttribute("id", moreBtn_idx)
            moreBtn.setAttribute("class", "LessButtons");
            moreBtn.textContent = "Less";
        } else {
            detailInfo.style.display = "none";
            moreBtn.setAttribute("class", "MoreButtons");
            moreBtn.textContent = "More";
        }
    };

    // now, all necessary divs and buttons are created
    // add the obj json info to the specific detail div
    display(detailInfo, data, idx);
}

// A function that display JSON content sent from server
function display(detailDiv, obj, i) {
    let category = obj.category;
    let description = obj.description;
    let photoURL = obj.photoURL;
    let dateTime = obj.dateTime;
    let location = obj.location;
    console.log(obj)

    var img_idx = "img" + i;
    var info_idx = "info" + i;
    var des_idx = "des" + i;

    if (photoURL) {
        let imageContainer = document.createElement("div");
        //imageContainer.setAttribute("class", "imgContainer");
        imageContainer.className = "imgContainer";
        detailDiv.appendChild(imageContainer);
        let itemImg = document.createElement("img");
        itemImg.setAttribute("id", img_idx);
        itemImg.setAttribute("class", "itemImgs");
        itemImg.src = photoURL;
        imageContainer.appendChild(itemImg);
    }

    let informationContainer = document.createElement("div");
    informationContainer.setAttribute("class", "infoContainer");
    detailDiv.appendChild(informationContainer);

    let info = document.createElement("div");
    info.setAttribute("id", info_idx);
    info.setAttribute("class", "infos");
    info.setAttribute('style', 'white-space: pre;');
    informationContainer.appendChild(info);

    if (category) {
        let categoryText = document.createElement("p");
        // categoryText.setAttribute("id", "categoryText");
        categoryText.setAttribute("class", "infos");
        categoryText.innerHTML = "<span>Category </span>" + '&nbsp' + category;
        informationContainer.appendChild(categoryText);
    }

    if (location) {
        let locationText = document.createElement("p");
        // categoryText.setAttribute("id", "locationText");
        locationText.setAttribute("class", "infos");
        locationText.innerHTML = "<span>Location </span>" + '&nbsp' + location;
        informationContainer.appendChild(locationText);
    }

    if (dateTime != " :00") {
        let dateText = document.createElement("p");
        // categoryText.setAttribute("id", "dateText");
        dateText.setAttribute("class", "infos");
        dateText.innerHTML = "<span>Date </span>" + '&nbsp' + dateTime;
        informationContainer.appendChild(dateText);
    }

    if (description) {
        let descript = document.createElement("p");
        descript.setAttribute("id", des_idx);
        descript.setAttribute("class", "infos");
        descript.textContent = description;
        informationContainer.appendChild(descript);
    }



}
