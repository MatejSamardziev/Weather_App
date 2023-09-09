'use strict'


let city=document.querySelector(".city-data h1")
let modal=document.querySelector(".modal");
let overlay=document.querySelector(".overlay")
let btnCloseModal=document.querySelector(".close-modal").addEventListener("click",closeModal);
let cityInput=document.querySelector(".search");

modal.addEventListener("click",function (e){
    if(e.target.classList.contains("city-item")){
       // console.log(e.target.getAttribute("lat"))
        closeModal();
        getWeather(e.target.getAttribute("lat"),e.target.getAttribute("lng"));
        getForecast(e.target.getAttribute("lat"),e.target.getAttribute("lng"));
    }
})




let srcButton=document.querySelector(".search-submit").addEventListener("click",function (e){
    let err=document.querySelector(".search-error")
    err.classList.add("hidden")
    e.preventDefault();
    SearchCity(cityInput.value)

})


let url = 'https://weatherapi-com.p.rapidapi.com/current.json?q=53.1%2C0.13';

const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '159132072fmsh431a0ecff128b0ep18a9ddjsn1162d26d9309',
        'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
    }
};



async function SearchCity(city){
    const cityOptions = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '159132072fmsh431a0ecff128b0ep18a9ddjsn1162d26d9309',
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        }
    };

      try {
          const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/places?limit=5&offset=0&types=CITY&namePrefix=${city}`
              , cityOptions);
          const result = await response.json();
         // console.log(result);
          if(result.data.length>1){
              showModal(result.data);
          }
          else if(result.data.length==0){
             throw new Error("No city has been found")
          }
          else{
              getWeather(result.data[0].latitude,result.data[0].longitude);
              getForecast(result.data[0].latitude,result.data[0].longitude);
          }

      }
      catch (error) {
          let err=document.querySelector(".search-error")
          err.innerHTML=error;
          err.classList.remove("hidden");
      }

}


function showError(){

}




navigator.geolocation.getCurrentPosition(function (position){
    let {latitude:lat,longitude:lng} = position.coords;

    getWeather(lat,lng)
    getForecast(lat,lng)


},function (){
    console.log("couldnt get position")
})


async function getWeather(lat,lng){
    try {

        const response = await fetch(`https://weatherapi-com.p.rapidapi.com/current.json?q=${lat}%2C${lng}`, options);
        const result = await response.json();

        renderMainData(result);
        renderAirConditions(result);

    } catch (error) {
        console.error(error);
    }
}

async function getForecast(lat,lng){
    try {

        const response = await fetch(`https://weatherapi-com.p.rapidapi.com/forecast.json?q=${lat}%2C${lng}&days=4`, options);
        const result = await response.json();

        renderForecast(result)
        render7DayForecast(result)
    } catch (error) {
        console.error(error);
    }
}


//render the day for the current forecast
function renderMainData(data){
  // console.log(data)
    let temp=document.querySelector(".city-data h2")
    let desc=document.querySelector(".city-data h3")
    let image=document.querySelector(".main-image")
    desc.innerHTML=data.current.condition.text;
    temp.innerHTML=`${data.current.temp_c}°C`
    city.innerHTML=data.location.name;
    image.setAttribute("src",data.current.condition.icon)
}



//Render the forecast for the entire day
function renderForecast(data)
{
  let forecasts=data.forecast.forecastday[0].hour;
  let nextDayForecasts=data.forecast.forecastday[1].hour;
  let currentTime=getCurrentTime();
  let slotsFilled=6;
  let tempTime=new Date();
  let hours =tempTime.getHours();
  let minutes = tempTime.getMinutes();

  let index=1; //to select dom element with same attribute value


  //gets all of the forecasts of the remaining day in 2 hour intervals
  for(let i=hours+1;i<forecasts.length;i+=2)
  {
      renderToday(forecasts[i],index)
      index++;
      slotsFilled--;
  }

  //if empty slots left, takes remaining data from the next day
  for(let i=0,j=0;i<slotsFilled;i++,j+=2)
  {
      renderToday(forecasts[i],index)
      index++;
  }
}


function render7DayForecast(data){
    document.querySelector(".forecast-container").innerHTML="";
   // console.log(data.forecast.forecastday[1]);
    for(let i=0;i<data.forecast.forecastday.length;i++){
        createDayData(data.forecast.forecastday[i]);
    }

}

function createDayData(data){
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const date = new Date(data.date);
    const dayOfWeek = daysOfWeek[date.getDay()];
    let html =`<div class="day-container">
              <h2>${dayOfWeek.slice(0,3)}</h2>
              <img class="day-image" src="${data.day.condition.icon}">
             <h3 class="day-desc">${data.day.condition.text}</h3>
            <h3 class="day-max">${data.day.maxtemp_c}</h3>
            <h3 class="day-min">/${data.day.mintemp_c}</h3>
        </div>`
    let container=document.querySelector(".forecast-container")
    container.insertAdjacentHTML("beforeend", html)
}



//function to display the data nicely
function renderToday(forecast,index){

    let time=forecast.time;
    let hour=document.querySelector(`.h${index}`)
    let img=document.querySelector(`.today-image-${index}`)
    let temp=document.querySelector(`.today-temp-${index}`)
    temp.innerHTML=forecast.temp_c;
    img.src=forecast.condition.icon;
    time=time.slice(time.indexOf(" "));
    hour.innerHTML=time;
}


function getCurrentTime(){
    let currentTime = new Date();
    let hours = currentTime.getHours();
    let minutes = currentTime.getMinutes();

// Ensure two-digit formatting
    hours = (hours < 10 ? '0' : '') + hours;
    minutes = (minutes < 10 ? '0' : '') + minutes;

    let timeString = hours + ':' + minutes;


    return timeString;
}


function renderAirConditions(data){
   // console.log(data)
   let feelsLike=document.querySelector(".feels-like-temp")
   let wind=document.querySelector(".wind")
   let prec=document.querySelector(".prec")
   let uv=document.querySelector(".uv-index")
    feelsLike.innerHTML=`${data.current.feelslike_c}°C`;
    wind.innerHTML=`${data.current.gust_kph} km/h`
    prec.innerHTML=`${data.current.precip_mm}`
    uv.innerHTML=`${data.current.uv}`

}


function showModal(data){
   modal.classList.toggle("hidden")
   let cityContainer=document.querySelector(".modal-city-container");
   cityContainer.innerHTML="";
   overlay.classList.toggle("hidden")
   //console.log(data)
   let html;
   data.forEach(curr=>{
       html=`<p class="city-item"  lat="${curr.latitude}" lng="${curr.longitude}">${curr.name} - ${curr.country}</p>`
       cityContainer.insertAdjacentHTML("beforeend",html);
   })
}

function closeModal(){
    modal.classList.toggle("hidden")
    overlay.classList.toggle("hidden")
}





