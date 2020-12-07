let navn = document.getElementById('navn')
let password = document.getElementById('password')
let login = document.getElementById('login')
let input = document.getElementById("password");


async function get(url) {
    const respons = await fetch(url);
    if (respons.status !== 200) // OK
        throw new Error(respons.status);
    return await respons.json();
}

async function post(url, objekt) {
    const respons = await fetch(url, {
        method: "POST",
        body: JSON.stringify(objekt),
        headers: { 'Content-Type': 'application/json' }
    });
    if (respons.status !== 200) // Created
        throw new Error(respons.status);
    return await respons.json();
}

window.addEventListener("keyup", function (event) {
    if (event.key === 'Enter') {
        document.getElementById("login").click();
    }
})

login.onclick = async () => {
    try {
        let session = await post("/login", { navn: navn.value, password: password.value })
        console.log(session);
        window.location.href = "/bestilling";
    } catch (e) {
        console.log(e)
        password.value = "";
        alert("Forkert password")
    }
}















