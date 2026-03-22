const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const goSignup = document.getElementById("goSignup");
const goLogin = document.getElementById("goLogin");

// toggle  
signupBtn.onclick = () => {
    loginForm.classList.remove("active");
    signupForm.classList.add("active");

    signupBtn.classList.add("active");
    loginBtn.classList.remove("active");
};

loginBtn.onclick = () => {
    signupForm.classList.remove("active");
    loginForm.classList.add("active");

    loginBtn.classList.add("active");
    signupBtn.classList.remove("active");
};

goSignup.onclick = () => signupBtn.click();
goLogin.onclick = () => loginBtn.click();


// login 
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector("input[type='email']").value;
    const password = loginForm.querySelector("input[type='password']").value;

    if (!email || !password) return;

    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await res.json();

        if (data.success) {
            alert(" Login Success");

            localStorage.setItem("user", JSON.stringify({
                id: data.user.id,
                name: data.user.username,
                email: data.user.email
            }));

            redirectUser();
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Login Failed");
    }
});


// signUp 
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = signupForm.querySelector("input[type='text']").value;
    const email = signupForm.querySelector("input[type='email']").value;
    const password = signupForm.querySelector("input[type='password']").value;

    if (!name || !email || !password) return;

    try {
        const res = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: name,
                email: email,
                password: password
            })
        });

        const data = await res.json();

        if (data.success) {
            alert("Signup Success");

            // save user locally
            localStorage.setItem("user", JSON.stringify({
                name,
                email
            }));

            redirectUser();
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Signup failed!");
    }
});


// redirect after login to Home page
function redirectUser() {
    const redirectUrl = localStorage.getItem("redirectAfterLogin");

    if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirectUrl;
    } else {
        window.location.href = "/Home/index.html";
    }
}

