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

        // tag matchihg
        let tagMatch = place.tags.filter(t => selectedTags.includes(t)).length;
        if (tagMatch > 0) {
            score += tagMatch * 2;
            reasons.push(`Matches ${tagMatch} interests`);
        }

        // region
        if (place.region === region) {
            score += 2;
            reasons.push("In your preferred region");
        }

        // terrain
        if (place.terrain === terrain) {
            score += 2;
            reasons.push("Matches preferred landscape");
        }

        // type 
        if (place.suitable_for.includes(persona)) {
            score += 2;
            reasons.push("Suitable for your travel type");
        }

        // rating
        score += place.rating / 2;

        results.push({ ...place, score, reasons });
    });

    results.sort((a, b) => b.score - a.score);

    let top = results.slice(0, 4);

    let output = document.getElementById("results");

output.innerHTML = "";

top.forEach(p => {
    output.innerHTML += `
        <div class="result-card">

            <div class="result-title">${p.name}</div>

            <div class="result-score">Score: ${p.score.toFixed(1)}</div>

            <div class="result-why">Why?</div>

            <div class="result-reasons">
                ${p.reasons.map(r => `• ${r}`).join("<br>")}
            </div>

        </div>
    `;
});
}