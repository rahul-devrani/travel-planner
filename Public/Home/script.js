document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/destinations/top')
        .then(res => res.json())
        .then(data => {
            const grid = document.getElementById('destGrid');
            grid.innerHTML = data.map(dest => `
                <div class="dest-card" onclick="location.href='../Details/details.html?id=${dest.id}'">
                    <img src="${dest.image_url}" style="width:100%; height:250px; object-fit:cover;">
                    <div style="padding:25px;">
                         <h3 style="color:#0c3c60; font-size:26px;">${dest.name}</h3>
                         <p style="color:#64748b; margin:10px 0;">${dest.description.substring(0, 80)}...</p>
                         <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
                            <span style="color:#f59e0b; font-weight:900; font-size:18px;"> ${dest.rating}</span>
                            <span style="background:#e0f2fe; color:#0369a1; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:700;">${dest.best_time}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        });});

const navBtn = document.getElementById("navusr"); 
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
    navBtn.innerText = user.name || user.email;
    navBtn.addEventListener("click", () => {
        const confirmLogout = confirm("logout ?");
        if (confirmLogout) {
            localStorage.removeItem("user");
            location.reload();
        }
    });
} else {
    navBtn.innerText = "Login";
    navBtn.addEventListener("click", () => {
        localStorage.setItem("redirectAfterLogin", window.location.href);
        window.location.href = "/Login/login.html";
    });
}
