let navn = document.getElementById('navn')
let password = document.getElementById('password')
let login = document.getElementById('login')

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
    // if (respons.status !== 201) // Created
    //     throw new Error(respons.status);
    return await respons.json();
}

login.onclick = async () => {
    try {
        console.log(password.value)
        let users = await post("/login", { navn: navn.value, password: password.value })
        console.log(users);
        window.location.href = "/bestilling";
    } catch (e) {
        password.value = "";
        alert("Forkert password")
    }
}















