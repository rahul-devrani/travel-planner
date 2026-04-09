document.addEventListener("DOMContentLoaded", async () => {
    // login/ logout
    const user = JSON.parse(localStorage.getItem("user"));
    const navBtn = document.getElementById("navUserBtn");

    if (user) {
        // if user is login then show name
        navBtn.innerText = user.username || user.name || "Logout";
        navBtn.onclick = () => {
            if (confirm("logout ??")) {
                localStorage.removeItem("user");
                location.reload();
            }
        };
    } else {
        // if not login -> login
        navBtn.innerText = "Login";
        navBtn.onclick = () => {
            window.location.href = "/Login/login.html";
        };
    }
})


document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const destId = params.get("id");

    // Load user info for nav
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) document.getElementById("navUserBtn").innerText = user.username;

    if (destId) {
        // id from Destination Page 
        try {
            const res = await fetch(`/api/destinations/${destId}`);
            const data = await res.json();
            document.getElementById("calcTitle").innerText = `Estimating for ${data.name}`;
            document.getElementById("destSelectGroup").style.display = "none";
            window.selectedDest = data;
        } catch (e) { console.error("Error fetching destination"); }
    } else {
        // Direct from Home 
        const res = await fetch('/api/destinations/all');
        const list = await res.json();
        const select = document.getElementById("destinationList");
        list.forEach(d => {
            select.innerHTML += `<option value='${JSON.stringify(d)}'>${d.name}</option>`;
        });
    }
});

// Location depend
function getMultiplier(name) {
    const expensive = ["Auli", "Mussoorie", "Nainital", "Lansdowne"];
    const moderate = ["Rishikesh", "Dehradun", "Kausani", "Almora", "Chopta"];

    if (expensive.includes(name)) return 1.45; // 45%
    if (moderate.includes(name)) return 1.15;  // 15%
    return 1.0; // normal price for others
}

function calculateBudget() {
    let dest;
    const selectVal = document.getElementById("destinationList").value;

    if (window.selectedDest) {
        dest = window.selectedDest;
    } else if (selectVal) {
        dest = JSON.parse(selectVal);
    }
    else {
        alert("Please select a destination first");
        return;
    }

    const days = parseInt(document.getElementById("days").value);
    const people = parseInt(document.getElementById("people").value);
    const category = document.getElementById("stayCategory").value;

    // base cost
    let baseStay = (category === 'luxury') ? 5000 : (category === 'mid' ? 2200 : 900);
    let baseFood = 650;
    let baseTrans = 1400;

    // location multiplier
    const multi = getMultiplier(dest.name);

    // activity buffer (rafting etc etc)
    let activityCost = 0;
    if (dest.name === "Rishikesh") activityCost = 1200 * people;
    if (dest.name === "Auli") activityCost = 1800 * people;

    //  to calculate min/max range
    const getRange = (base) => ({ min: base * 0.9, max: base * 1.3 });

    const stay = getRange(baseStay * multi * days * Math.ceil(people / 2));
    const food = getRange((baseFood * multi * days * people) + activityCost);
    const trans = getRange(baseTrans * multi * days);

    const minTotal = stay.min + food.min + trans.min;
    const maxTotal = stay.max + food.max + trans.max;

    // display 
    document.getElementById("resultCard").style.display = "block";
    document.getElementById("minTotal").innerText = `₹${Math.round(minTotal).toLocaleString()}`;
    document.getElementById("maxTotal").innerText = `₹${Math.round(maxTotal).toLocaleString()}`;

    document.getElementById("stayRange").innerText = `₹${Math.round(stay.min).toLocaleString()} - ₹${Math.round(stay.max).toLocaleString()}`;
    document.getElementById("transRange").innerText = `₹${Math.round(trans.min).toLocaleString()} - ₹${Math.round(trans.max).toLocaleString()}`;
    document.getElementById("foodRange").innerText = `₹${Math.round(food.min).toLocaleString()} - ₹${Math.round(food.max).toLocaleString()}`;

    document.getElementById("resultCard").scrollIntoView({ behavior: 'smooth', block: 'center' });
}



