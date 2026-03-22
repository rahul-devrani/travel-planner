let map;

document.addEventListener("DOMContentLoaded", async () => {

    const id = new URLSearchParams(window.location.search).get("id");
    const user = JSON.parse(localStorage.getItem("user"));

    const navBtn = document.getElementById("navUserBtn");

    if (user) {
        navBtn.innerText = user.name || user.email;
        navBtn.onclick = () => {
            localStorage.removeItem("user");
            location.reload();
        };
    } else {
        navBtn.onclick = () => {
            window.location.href = "/Login/login.html";
        };
    }

    const res = await fetch(`/api/destinations/${id}`);
    const data = await res.json();

    document.getElementById("placeName").innerText = data.name;
    document.getElementById("placeType").innerText = data.type;
    document.getElementById("placeType2").innerText = data.type;
    document.getElementById("heroImg").src = "/" + data.image_url;
    document.getElementById("descp").innerText = data.descp;
    document.getElementById("bestTime").innerText = data.best_time;
    document.getElementById("rating").innerText = data.rating;

    initMap(data.lat, data.lng, id);
    loadPOI(id);
    loadWeather(data.name);
    loadReviews(id);
});



// map
function initMap(lat, lng, id) {
    map = L.map('mapBox').setView([lat, lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    L.marker([lat, lng]).addTo(map);

    fetch(`/api/poi/${id}`)
        .then(res => res.json())
        .then(pois => {
            pois.forEach(p => {
                L.marker([p.lat, p.lng]).addTo(map);
            });
        });
}


// weather
async function loadWeather(city) {

    const API_KEY = "e8fc3153a5818ab99baeba67d3539b47";

    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );

    const data = await res.json();
    const box = document.getElementById("weatherList");

    box.innerHTML = "";

    for (let i = 0; i < 6; i++) {

        const d = data.list[i * 8];

        box.innerHTML += `
        <div class="weather-card">
            <p>${new Date(d.dt_txt).toDateString().slice(0,10)}</p>
            <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png">
            <p>${Math.round(d.main.temp)}°C</p>
        </div>`;
    }
}


// poi
async function loadPOI(id) {
    const res = await fetch(`/api/poi/${id}`);
    const data = await res.json();

    document.getElementById("poiGrid").innerHTML =
        data.map(p => `<div class="poi-card">${p.name}</div>`).join("");
}


// reviews
async function loadReviews(id) {

    const res = await fetch(`/api/reviews/${id}`);
    const data = await res.json();

    const user = JSON.parse(localStorage.getItem("user"));

    document.getElementById("reviewList").innerHTML =
        data.map(r => `
        <div class="review-item">
            <b>${r.username}</b>
            <p>${r.comment}</p>

            ${user && user.id === r.user_id
                ? `<button onclick="deleteReview(${r.id}, ${user.id})">Delete</button>`
                : ""}
        </div>
    `).join("");
}


// submit review
async function submitReview() {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "/Login/login.html";
        return;
    }

    const text = document.getElementById("reviewText").value;
    const id = new URLSearchParams(window.location.search).get("id");

    await fetch(`/api/reviews`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            destination_id:id,
            user_id:user.id,
            rating:5,
            comment:text
        })
    });

    location.reload();
}

// delete review
async function deleteReview(id, userId) {
    await fetch(`/api/reviews/${id}/${userId}`, {
        method: "DELETE"
    });
    location.reload();
}


// buttons
function goBudget() {
    window.location.href = "/budget/budget.html";
}

function goRecommend() {
    window.location.href = "/recommend/recommend.html";
}