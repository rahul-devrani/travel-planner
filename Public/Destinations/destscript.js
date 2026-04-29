document.addEventListener('DOMContentLoaded', () => {

    // login nav 
    const navBtn = document.getElementById("navUserBtn");
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
        navBtn.innerText = user.name || user.email;

        navBtn.onclick = () => {
            if (confirm("Logout ?")) {
                localStorage.removeItem("user");
                location.reload();
            }
        };

    } else {
        navBtn.innerText = "Login";

        navBtn.onclick = () => {
            localStorage.setItem("redirectAfterLogin", window.location.href);
            window.location.href = "/Login/login.html";
        };
    }

    // dest data 
    let allDestinations = [];
    const destGrid = document.getElementById('destGrid'); // Matches HTML ID
    const searchInput = document.getElementById('searchInput');
    const tags = document.querySelectorAll('.tag');

    fetch('/api/destinations/all')
        .then(res => res.json())
        .then(data => {
            allDestinations = data;
            renderCards(allDestinations);
        })
        .catch(err => {
            console.error("Error fetching data:", err);
            destGrid.innerHTML = `
                <h2 style="color:white; grid-column: span 3; text-align:center;">
                    Server connection failed...
                </h2>`;
        });

    function renderCards(data) {
        if (!data || data.length === 0) {
            destGrid.innerHTML = `
                <div style="grid-column: span 3; text-align: center; padding: 50px;">
                    <h2 style="color: #0c3c60;">Place Not Found</h2>
                </div>`;
            return;
        }

        destGrid.innerHTML = data.map(item => `
            <div class="card" onclick="window.location.href='../Details/details.html?id=${item.id}'">
                <img src="/${item.image_url}" alt="${item.name}">
                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description.substring(0, 110)}...</p>
                    <div class="card-meta">
                        <span class="rating">⭐ ${item.rating}</span>
                        <span class="best-time">${item.best_time}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // search 
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();

        const filtered = allDestinations.filter(d =>
            d.name.toLowerCase().includes(term) ||
            d.description.toLowerCase().includes(term)
        );

        renderCards(filtered);
    });

    // tag filters 
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            const selectedType = tag.getAttribute('data-cat');

            if (selectedType === 'all') {
                renderCards(allDestinations);
            } else {
                const filtered = allDestinations.filter(d => d.type === selectedType);
                renderCards(filtered);
            }

            searchInput.value = '';
        });
    });

});
