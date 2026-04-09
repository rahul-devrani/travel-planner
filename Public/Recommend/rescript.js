function getRecommendations() {
    let selectedTags = Array.from(document.querySelectorAll("input[type=checkbox]:checked"))
        .map(cb => cb.value.toLowerCase());

    let region = document.getElementById("region").value;
    let terrain = document.getElementById("terrain").value;
    let persona = document.getElementById("persona").value;

    let places = [
        {
            name: "Rishikesh",
            region: "Garhwal",
            terrain: "River",
            tags: ["adventure", "spiritual"],
            suitable_for: ["Solo", "Friends"],
            rating: 4.8
        },
        {
            name: "Mussoorie",
            region: "Garhwal",
            terrain: "Hill",
            tags: ["nature"],
            suitable_for: ["Couple", "Family"],
            rating: 4.5
        },
        {
            name: "Nainital",
            region: "Kumaon",
            terrain: "Lake",
            tags: ["nature"],
            suitable_for: ["Family", "Couple"],
            rating: 4.7
        },
        {
            name: "Auli",
            region: "Garhwal",
            terrain: "Snow",
            tags: ["snow", "adventure"],
            suitable_for: ["Friends"],
            rating: 4.6
        },
        {
            name: "Chopta",
            region: "Garhwal",
            terrain: "Meadow",
            tags: ["nature", "trekking"],
            suitable_for: ["Solo", "Friends"],
            rating: 4.9
        }
    ];

    let results = [];

    places.forEach(place => {
        let score = 0;
        let reasons = [];

        let tagMatch = place.tags.filter(t => selectedTags.includes(t)).length;
        if (tagMatch > 0) {
            score += tagMatch * 3;
            reasons.push(`Matches ${tagMatch} of your interests`);
        }

        if (place.region === region) {
            score += 2;
            reasons.push("Located in your favorite region");
        }

        if (place.terrain === terrain) {
            score += 2;
            reasons.push(`Features the ${place.terrain} landscape you love`);
        }

        if (place.suitable_for.includes(persona)) {
            score += 2;
            reasons.push(`Perfectly suited for ${persona} travel`);
        }

        score += place.rating;
        results.push({ ...place, score, reasons });
    });

    results.sort((a, b) => b.score - a.score);
    let top = results.filter(r => r.score > 5).slice(0, 4);

    const output = document.getElementById("results");
    const header = document.getElementById("results-header");

    if (top.length > 0) {
        header.style.display = "block";
        output.innerHTML = "";
        top.forEach(p => {
            output.innerHTML += `
                <div class="result-card">
                    <div class="result-title">${p.name}</div>
                    <div class="result-score">Compatibility Score: ${p.score.toFixed(1)}</div>
                    <div class="result-why">Why we recommend this:</div>
                    <div class="result-reasons">
                        ${p.reasons.map(r => `• ${r}`).join("<br>")}
                    </div>
                </div>
            `;
        });
        // Scroll smoothly to results
        header.scrollIntoView({ behavior: 'smooth' });
    } else {
        header.style.display = "block";
        header.innerHTML = "<h2 class='results-title'>No exact matches, try changing filters!</h2>";
        output.innerHTML = "";
    }
}

const navBtn = document.getElementById("navUserBtn");

const user = JSON.parse(localStorage.getItem("user"));

// if user logged in
if (user) {
    navBtn.innerText = user.name || user.email;

    // click → logout
    navBtn.addEventListener("click", () => {
        const confirmLogout = confirm("logout ?");
        if (confirmLogout) {
            localStorage.removeItem("user");
            location.reload();
        }
    });

} else {
    // not logged in → go to login
    navBtn.innerText = "Login";

    navBtn.addEventListener("click", () => {
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "/Login/login.html";
    });
}