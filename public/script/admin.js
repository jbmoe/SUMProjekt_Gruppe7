let modals = document.getElementsByClassName("modal");
let createProductModal = document.getElementById("opretModal");
let updateProductModal = document.getElementById("ændreModal");
let createUserModal = document.getElementById("opretUserModal")
let allUsersModal = document.getElementById("allUsersModal")
let orderModal = document.getElementById("bestillingModal")
let editModal = document.getElementById('showOrder')
let openModalBtns = document.getElementsByClassName("openModal");
let closeElements = document.querySelectorAll("#close");
let inputData = document.getElementsByClassName('data')
let inputUserData = document.getElementsByClassName('userData')
let productTable = document.getElementById('produktTable')
let userTable = document.getElementById('userTable')
let orderTab = document.getElementById('bestilling')
let products = [];
let users = []

async function initialize() {
    try {
        products = await get('api/products');
        users = await get('admin/users')
    } catch (fejl) {
        console.log(fejl);
    }
}

function closeModals(event) {
    if (event.target == createProductModal || event.target == updateProductModal || event.target == createUserModal || event.target == allUsersModal || event.key == 'Escape') {
        createProductModal.style.display = "none";
        updateProductModal.style.display = "none";
        createUserModal.style.display = "none";
        allUsersModal.style.display = "none";
        orderModal.style.display = "none";
        editModal.style.display = "none"
        clearFields()
    }
}

async function createUser() {
    let username = inputUserData[0].value;
    let password = inputUserData[1].value;
    let confirmPassword = inputUserData[2].value;
    let admin = inputUserData[3].checked;

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

    clearFields()

    createUserModal.style.display = "none";

    let createdUser = await post('/admin', user);
    user._id = createdUser.created._id;
    users.push(user)
    insertUserRow(user)
    console.log('Bruger oprettet', user);
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

    clearFields()

    let createdProduct = await post('/api/products/', product);
    product._id = createdProduct.created._id;
    console.log('Produkt oprettet', product);
    products.push(product)
    insertProductRow(product)
}

function createUserTable() {
    for (const u of users) insertUserRow(u)
}

function insertUserRow(user) {
    let row = userTable.insertRow();

    let username = document.createElement('input')
    username.value = user.username
    let cellUsername = row.insertCell(0)
    cellUsername.appendChild(username)

    let password = document.createElement('input')
    password.setAttribute('type', 'password')
    password.value = user.password
    let cellPassword = row.insertCell(1)
    cellPassword.appendChild(password)

    let admin = document.createElement('input')
    admin.setAttribute('type', 'checkbox')
    admin.checked = user.admin
    let cellAdmin = row.insertCell(2);
    cellAdmin.appendChild(admin)

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
        updateUser(user, [username.value, password.value, admin.checked]);
    }
    deleteCell.onclick = () => {
        row.parentNode.removeChild(row)
        deleteUser(user);
    }
}

async function updateUser(user, data) {
    let u = {
        username: data[0],
        password: data[1],
        admin: data[2]
    }

    console.log(await post(`/admin/users/update/${user._id}`, u));
}


async function deleteUser(user) {
    console.log(await deLete(`/admin/users/${user._id}`))
    users.splice(users.indexOf(user), 1)
}


function createProductTable() {
    for (const p of products) insertProductRow(p)
}

function insertProductRow(product) {
    // Create an empty <tr> element and add it to the last position of the table
    let row = productTable.insertRow();

    // Inserts three new cells (<td> elements) 
    // at the 1st, 2nd and 3rd position of the "new" <tr> element
    // and adds data to the new cells
    let name = document.createElement('input')
    name.value = product.name
    let cellName = row.insertCell(0)
    cellName.appendChild(name)

    let price = document.createElement('input')
    price.setAttribute('type', 'number')
    price.style.maxWidth = '40px'
    price.value = product.price
    let cellPrice = row.insertCell(1)
    cellPrice.appendChild(price)

    let category = document.createElement('select')
    category.id = product._id   // Gives each select element a unique id according to product id, for easy value extraction
    let options = [document.createElement("option"), document.createElement("option"), document.createElement("option")];
    options[0].text = "Madvare";
    options[1].text = "Drikkevare";
    options[2].text = "Diverse";

    // Sets selected option to be current category
    if (product.category === 'Madvare') options[0].setAttribute('selected', 'selected')
    else if (product.category === 'Drikkevare') options[1].setAttribute('selected', 'selected')
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
    console.log(await post(`/api/products/update/${product._id}`, p), p);
}

async function deleteProduct(product) {
    console.log(await deLete(`/api/products/${product._id}`), product)
    products.splice(products.indexOf(product), 1)
}

function createOrdersTable() {
    let table = document.getElementById('ordersContent')
    table.innerHTML = ''

    Array.from(table.parentElement.getElementsByTagName('th')).forEach((item, index) => {
        if (index !== 2) item.onclick = () => sortTable(index, table)
    })

    for (const o of orders) {
        let row = table.insertRow();
        row.insertCell().innerHTML = o.table;
        row.insertCell().innerHTML = o.price;
        row.insertCell().innerHTML = new Date(o.time).toLocaleDateString()

        let cellShow = row.insertCell();
        let showBtn = document.createElement('button');
        showBtn.onclick = () => showOrder(o)
        showBtn.innerHTML = 'Vis'
        cellShow.appendChild(showBtn)
    }
}

function showOrder(order) {
    editModal.style.display = "block"

    let d = new Date(order.time)
    document.getElementById('tid').innerHTML = `Klokkeslet: ${d.toLocaleTimeString()}`
    document.getElementById('dato').innerHTML = `Dato: ${d.toLocaleDateString()}`

    let table = document.getElementById('showOrderContent');
    table.innerHTML = ''
    let salgslinjer = JSON.parse(order.products);

    for (const s of salgslinjer) {
        let row = table.insertRow();
        row.insertCell().innerHTML = s.navn
        row.insertCell().innerHTML = s.antal;
        row.insertCell().innerHTML = s.samletPris;
    }

    let samletPrisRow = table.insertRow();
    samletPrisRow.insertCell().innerHTML = 'Samlet pris';
    samletPrisRow.insertCell() // Emtpy cell for looks
    samletPrisRow.insertCell().innerHTML = order.price;

    let waiterRow = table.insertRow()
    waiterRow.insertCell().innerHTML = 'Tjener'
    waiterRow.insertCell() // Emtpy cell for looks
    waiterRow.insertCell().innerHTML = order.waiter;

    let bemærkningRow = table.insertRow();
    bemærkningRow.insertCell().innerHTML = 'Bemærkning'

    let bemærkningCell = bemærkningRow.insertCell();
    bemærkningCell.setAttribute('colspan', '2')
    bemærkningCell.innerHTML = order.comment

}

function clearFields() {
    for (input of inputData) input.value = '';
    for (input of inputUserData) input.value = '';
    inputUserData[3].checked = false;
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
            createProductModal.style.display = "none";
            updateProductModal.style.display = "none";
            createUserModal.style.display = "none";
            allUsersModal.style.display = "none";
            orderModal.style.display = "none";
            editModal.style.display = "none"
            clearFields();
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
    orderTab.addEventListener('click', function () {
        window.location.href = '/bestilling'
    }, false)

    await initialize();
    createProductTable();
    createUserTable();
    createOrdersTable();
}

main();