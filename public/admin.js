var modals = document.getElementsByClassName("modal");
var opretModal = document.getElementById("opretModal");
var ændreModal = document.getElementById("ændreModal");
var userModal = document.getElementById("opretUserModal")
var allUsersModal = document.getElementById("allUsersModal")
var openModalBtns = document.getElementsByClassName("openModal");
var closeElements = document.querySelectorAll("#close");
var inputData = document.getElementsByClassName('data')
var inputUserData = document.getElementsByClassName('userData')
var productTable = document.getElementById('produktTable')
var bestillingTab = document.getElementById('bestilling')
var logoutTab = document.getElementById('logout')
var products = [];
var users = []



async function initialize() {
    try {
        products = await get('api/products');
        user = await get('admin/users')
    } catch (fejl) {
        console.log(fejl);
    }
}

function closeModals(event) {
    if (event.target == opretModal || event.target == ændreModal || event.target == userModal || event.target == allUsersModal || event.key == 'Escape') {
        opretModal.style.display = "none";
        ændreModal.style.display = "none";
        userModal.style.display = "none";
        allUsersModal.style.display = "none";
        for (input of inputData) input.value = '';
    }
}

async function createUser() {
    let username = inputUserData[0].value;
    let password = inputUserData[1].value;
    let confirmPassword = inputUserData[2].value;
    let admin = inputUserData[3].checked == true;

    try {
        if (!username) throw 'Indtast brugernavn'
        if (!password) throw 'Indtast password'
        if (password !== confirmPassword) throw 'Passwordet er ikke ens'
    } catch (err) {
        alert(err)
        return;
    }

    let user = {
        username,
        password,
        admin
    };

    for (input of inputUserData) input.value = '';
    inputUserData[3].checked = false;

    userModal.style.display = "none";

    await post('/admin', user);
    users.push(user)
}

async function createProduct() {
    let name = inputData[0].value;
    let price = parseInt(inputData[1].value);
    let category = inputData[2].value;

    try {
        if (!name) throw 'Indtast korrekt navn på produktet'
        if (!category) throw 'Indtast korrekt kategori på produktet'
        if (isNaN(price)) throw 'Indtast korrekt pris på produktet'
    } catch (err) {
        alert(err)
        return;
    }

    let product = {
        name,
        price,
        category
    };

    for (input of inputData) input.value = '';

    let createdProduct = await post('/api/products/', product);
    product._id = createdProduct.created._id;
    console.log('Produkt oprettet', product);
    products.push(product)
    insertProductRow(product)
}

function createProductTable() {
    for (const p of products) insertProductRow(p)
}

function insertProductRow(product) {
    // Create an empty <tr> element and add it to the last position of the table
    var row = productTable.insertRow();

    // Inserts three new cells (<td> elements) 
    // at the 1st, 2nd and 3rd position of the "new" <tr> element
    // and adds data to the new cells
    var data = [product.name, product.price, product.category];

    let name = document.createElement('input')
    name.value = data[0]
    let cellName = row.insertCell(0)
    cellName.appendChild(name)

    let price = document.createElement('input')
    price.setAttribute('type', 'number')
    price.style.maxWidth = '40px'
    price.value = data[1]
    let cellPrice = row.insertCell(1)
    cellPrice.appendChild(price)

    let category = document.createElement('select')
    category.id = product._id   // Gives each select element a unique id according to product id, for easy value extraction
    let options = [document.createElement("option"), document.createElement("option"), document.createElement("option")];
    options[0].text = "Madvare";
    options[1].text = "Drikkevare";
    options[2].text = "Diverse";

    // Sets selected option to be current category
    if (data[2] === 'Madvare') options[0].setAttribute('selected', 'selected')
    else if (data[2] === 'Drikkevare') options[1].setAttribute('selected', 'selected')
    else options[2].setAttribute('selected', 'selected')

    category.add(options[0]);
    category.add(options[1]);
    category.add(options[2]);
    row.insertCell(2).innerHTML = category.outerHTML;

    // Creates two cells for update and delete functions
    let okCell = row.insertCell(3);
    let imgUpdate = document.createElement('img');
    imgUpdate.src = '../img/ok.png'
    okCell.appendChild(imgUpdate);

    let deleteCell = row.insertCell(4);
    let imgDelete = document.createElement('img');
    imgDelete.src = '../img/slet.png'
    deleteCell.appendChild(imgDelete);


    // Sets onclick for update and delete cells
    okCell.onclick = () => {
        updateProduct(product, [name.value, price.value, document.getElementById(product._id).value]);
    }
    deleteCell.onclick = () => {
        row.parentNode.removeChild(row)
        deleteProduct(product);
    }
}

async function updateProduct(product, data) {
    let p = {
        name: data[0],
        price: parseInt(data[1]),
        category: data[2]
    }
    // console.log(p);
    console.log(await post(`/api/products/update/${product._id}`, p), p);
}

async function deleteProduct(product) {
    console.log(await deLete(`/api/products/${product._id}`), product)
    products.splice(products.indexOf(product), 1)
}

async function post(url, objekt) {
    const respons = await fetch(url, {
        method: "POST",
        body: JSON.stringify(objekt),
        headers: { 'Content-Type': 'application/json' }
    });
    if (!(respons.status == 200 || respons.status == 201)) // Created
        throw new Error(respons.status);
    return await respons.json();
}

async function get(url) {
    const respons = await fetch(url);
    if (respons.status !== 200) // OK
        throw new Error(respons.status);
    return await respons.json();
}

async function deLete(url) {
    let respons = await fetch(url, {
        method: "DELETE"
    });
    if (respons.status !== 200) // OK
        throw new Error(respons.status);
    return await respons.json();
}

async function main() {
    for (let i = 0; i < openModalBtns.length; i++) {
        openModalBtns[i].onclick = () => {
            modals[i].style.display = 'block';
        }
    }

    // When the user clicks on <span> (x) or annuller, close the modals
    for (e of closeElements) {
        e.onclick = function () {
            opretModal.style.display = "none";
            ændreModal.style.display = "none";
            userModal.style.display = "none";
            allUsersModal.style.display = "none";
            for (input of inputData)
                input.value = '';
            for (input of inputUserData) input.value = '';
            inputUserData[3].checked = false;
        }
    }

    // When the user clicks anywhere outside of the modal or the escape button, close it
    window.onclick = (event) => closeModals(event);
    document.body.addEventListener('keyup', (event) => closeModals(event))

    document.getElementById('opret').onclick = createProduct;
    document.getElementById('opretUser').onclick = createUser
   

    document.getElementById('logout').onclick = () => {
        window.location.href = '/logout'
    }
    bestillingTab.addEventListener('click', function () {
        window.location.href = '/bestilling'
    }, false)

    await initialize();
    createProductTable();
}

main();