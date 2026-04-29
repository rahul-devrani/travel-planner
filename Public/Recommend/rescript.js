async function getRecommendations() {
    const output = document.getElementById("results");
    const header = document.getElementById("res");

    // get user input
    const selectedTags = Array.from(document.querySelectorAll("input[type=checkbox]:checked"))
        .map(cb => cb.value.toLowerCase());

    const region = document.getElementById("region").value;
    const terrain = document.getElementById("terrain").value;
    const persona = document.getElementById("persona").value;

    try {
        // fetch all destinations from the database
        const response = await fetch('/api/destinations/all');
        const places = await response.json();

        let results = [];

        // process each place from the database
        places.forEach(place => {
            let score = 0;
            let reasons = [];

            // match tags or type by splitting tags if they are stored as a comma separated string
            let placeTags = place.tags ? place.tags.split(',') : [place.type.toLowerCase()];
            
            let tagMatch = placeTags.filter(t => selectedTags.includes(t.trim().toLowerCase())).length;
            if (tagMatch > 0) {
                score += tagMatch * 3;
                reasons.push(`Matches your interest in ${place.type}`);
            }

            // match region
            if (place.region === region) {
                score += 2;
                reasons.push(`Located in the ${place.region} region`);
            }

            // match landscape
            if (place.terrain === terrain) {
                score += 2;
                reasons.push(`Matches your preferred ${place.terrain} landscape`);
            }

            // match persona
            if (place.suitable_for && place.suitable_for.includes(persona)) {
                score += 2;
                reasons.push(`Great for ${persona} travelers`);
            }

            // add base rating to score
            score += parseFloat(place.rating);

            results.push({ ...place, score, reasons });
        });

        // sort by highest score and pick top 4
        results.sort((a, b) => b.score - a.score);
        let top = results.filter(r => r.score > 4).slice(0, 4);

        // display results
        if (top.length > 0) {
            header.style.display = "block";
            output.innerHTML = "";
            top.forEach(p => {
                output.innerHTML += `
                    <div class="result-card" onclick="location.href='../Details/details.html?id=${p.id}'" style="cursor:pointer;">
                        <div class="result-title">${p.name}</div>
                        <div class="result-score">Compatibility Score: ${p.score.toFixed(1)}</div>
                        <div class="result-why">Why we recommend this:</div>
                        <div class="result-reasons">
                            ${p.reasons.map(r => `• ${r}`).join("<br>")}
                        </div>
                    </div>
                `;
            });
            header.scrollIntoView({ behavior: 'smooth' });
        } else {
            header.style.display = "block";
            header.innerHTML = "<h2 class='results-title'>No matches found, please adjust your filters</h2>";
            output.innerHTML = "";
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        header.style.display = "block";
        header.innerHTML = "<h2 class='results-title'>Connection to database failed</h2>";
    }
}

// navigation / login
const navBtn = document.getElementById("navUserBtn");
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
    // user logged in
    navBtn.innerText = user.name || user.email;
    navBtn.onclick = () => {
        if (confirm("Logout?")) {
            localStorage.removeItem("user");
            location.reload();
        }
    };
} else {
    // not logged in
    navBtn.innerText = "Login";
    navBtn.onclick = () => {
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "/Login/login.html";
    };
}
