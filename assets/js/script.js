
var DateTime = luxon.DateTime;
var now = DateTime.now();
var apiKey = "f0d05581b4701cfe6205823e1bb408ca";
var lat;
var lon;
var currCon;
var currTemp;
var currWind;
var currHum;
var currUv = "";
var tempArr = [];
var cityArr = [];
var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=";
var apiOneCall = "https://api.openweathermap.org/data/2.5/onecall?units=metric";

//Main function to get weather data
function getWeather() {
  clearContents();
  //First fetch current day data based on city name
  fetch(apiUrl + cityName + "&units=metric&appid=" + apiKey).then(function (
    response
  ) {
    if (response.ok) {
      response.json().then(function (data) {
        cityName = data.name;
        lat = data.coord.lat;
        lon = data.coord.lon;
        currCon = data.weather[0].main;
        currTemp = data.main.temp;
        currWind = data.wind.speed;
        currHum = data.main.humidity;
        //Using the lat and lon values from the first fetch, do another fetch for the oneCall data
        fetch(
          apiOneCall + "&lat=" + lat + "&lon=" + lon + "&appid=" + apiKey
        ).then(function (oneCallResponse) {
          if (oneCallResponse.ok) {
            oneCallResponse.json().then(function (oneCallData) {
              currUv = oneCallData.current.uvi;
              tempArr = oneCallData.daily;
              displayWeather();
              saveHistory();
              populateHistory();
            });
          } else {
            alert("Something went wrong");
          }
        });
      });
    } else {
      alert("Choose a valid city");
    }
  });
}

//Main function to display data on the page
function displayWeather() {
  //Declare local variables with elements
  var cityText = $("<div>");
  var conIcon = $("<i>");
  var cityRow = $("<div>");
  var tempText = $("<div>");
  var windText = $("<div>");
  var humText = $("<div>");
  var uvLabel = $("<div>");
  var uvText = $("<div>");
  var uvRow = $("<div>");

  //Add classes to the elements
  cityText.addClass("city-name font-bold text-lg");
  conIcon.addClass("mt-1 ml-2");
  tempText.addClass("weather-info");
  windText.addClass("weather-info");
  humText.addClass("weather-info");
  uvText.addClass("weather-info");
  uvLabel.addClass("weather-info mr-2");
  uvRow.addClass("uv-row flex flex-row");
  cityRow.addClass("city-row flex flex-row");
  //Call iconClass function to get the appropriate icon
  conIcon.addClass(iconClass(currCon));

  //Check the current UV Index and change colour of UV text
  //based on the UVI value
  if (currUv < 3) {
    uvText.addClass("bg-green-200 rounded-full");
  } else if (currUv > 2 && currUv < 6) {
    uvText.addClass("bg-yellow-200 rounded-full");
  } else if (currUv > 5 && currUv < 8) {
    uvText.addClass("bg-red-200 rounded-full");
  } else if (currUv > 7) {
    uvText.addClass("bg-red-400 rounded-full");
  }

  //Modify the elements text and append it to the div element on the page
  cityText.text(cityName + "(" + now.toLocaleString(DateTime.DATE_SHORT) + ")");
  tempText.text("Temp: " + currTemp + " C");
  windText.text("Wind: " + currWind + " KPH");
  humText.text("Humidity: " + currHum + "%");
  uvText.text(currUv);
  uvLabel.text("UV Index:");
  cityRow.append(cityText);
  cityRow.append(conIcon);
  $(".weather").append(cityRow);
  $(".weather").append(tempText);
  $(".weather").append(windText);
  $(".weather").append(humText);
  uvRow.append(uvLabel);
  uvRow.append(uvText);
  $(".weather").append(uvRow);

  //Add data to the cards by iterating through the array containing the
  //daily data
  for (i = 1; i < 6; i++) {
    var d = now.plus({ days: i }).toLocaleString(DateTime.DATE_SHORT);
    var dayClass = ".day" + i;
    var dayDailyText = $("<div>");
    var dailyIcon = $("<i>");
    var tempDailyText = $("<div>");
    var windDailyText = $("<div>");
    var humDailyText = $("<div>");
    dayDailyText.addClass("daily-weather font-bold");
    tempDailyText.addClass("daily-weather");
    windDailyText.addClass("daily-weather");
    humDailyText.addClass("daily-weather");
    dailyIcon.addClass(iconClass(tempArr[i].weather[0].main));
    dayDailyText.text(d);
    tempDailyText.text("Temp: " + tempArr[i].temp.day + " C");
    windDailyText.text("Wind: " + tempArr[i].wind_speed + " KPH");
    humDailyText.text("Humidity: " + tempArr[i].humidity + "%");
    $(dayClass).append(dayDailyText);
    $(dayClass).append(dailyIcon);
    $(dayClass).append(tempDailyText);
    $(dayClass).append(windDailyText);
    $(dayClass).append(humDailyText);
  }
}

//Populate the search history by getting list of cities from localstorage
function populateHistory() {
  cityArr = JSON.parse(localStorage.getItem("savedCities"));
  if (!cityArr) {
    cityArr = [];
  }
  $(".city-history").empty();

  //For each city in the array, create a button and append it to the page
  for (i = 0; i < cityArr.length; i++) {
    var cityHist = $("<button>");
    cityHist.addClass(
      "cityBtn mt-3 bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-10 rounded-full"
    );
    cityHist.attr("id", cityArr[i]);
    cityHist.text(cityArr[i]);
    $(".city-history").append(cityHist);
  }
}


//Clear the weather data currently on the page
function clearContents() {
  $(".weather").empty();
  for (i = 1; i < 6; i++) {
    var dayClass = ".day" + i;
    $(dayClass).empty();
  }
}

//Save the list of previously searched cities in the localstorage
function saveHistory() {
  if (!cityArr.includes(cityName)) {
    cityArr.unshift(cityName);
  }
  //Limit the list of cities to 10 by popping the oldest city
  if (cityArr.length > 10) {
    cityArr.pop();
  }
  localStorage.setItem("savedCities", JSON.stringify(cityArr));
}

//Return the weather icon based on the weather condition
//these icons are not working. I am doing something wrong. Need to fix.
function iconClass(condition) {
  if (condition == "Clouds") {
    return "bi bi-cloud";
  } else if (condition == "Clear") {
    return "bi bi-brightness-high";
  } else if (condition == "Haze") {
    return "bi-cloud-haze";
  } else if (condition == "Rain") {
    return "bi bi-cloud-rain";
  }
}

$(".container").on("click", "#submitcity", function () {
  cityName = $("#cityinput").val().trim();
  $("#cityinput").val("");
  getWeather();
});

//If the enter button is pushed on the input, then do the same
//as if the searc button was clicked
$("#cityinput").keypress(function (e) {
  if (e.which == 13) {
    cityName = $("#cityinput").val().trim();
    $("#cityinput").val("");
    getWeather();
  }
});

//If one of the search history city buttons are clicked, get the
//weather for that city
$(".container").on("click", ".cityBtn", function () {
  cityName = $(this).attr("id");
  getWeather();
});

//Load the previously searched cities and initialize the page
populateHistory();
getWeather();