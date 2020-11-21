var regningContent = document.getElementById('regningContent');
var bordSelect = document.getElementById('bordNr')
var regning = document.getElementById('regning')
var samletPrisInput = document.getElementById('samletPris')
var close = document.getElementById('close')
var borderModal = document.getElementById('bordeModal')
var editModal = document.getElementById('editModal')
var editOrderTable = document.getElementById('editOrder');
var orderTable = document.getElementById('orders');
var products = [];
var bestillingMap = new Map();

function createProductTable() {
    for (const p of products) {
        insertProductRow(p)
    }
}

function insertProductRow(product) {
    var row = document.getElementById('produktTable').insertRow();

    var data = [product.name, product.price, product.category];
    for (let i = 0; i < 3; i++) {
        let cell = row.insertCell(i);
        cell.innerHTML = data[i];
    }

    row.onclick = () => addToBestilling(product)
}

function addToBestilling(product) {

    if (bestillingMap.has(product._id)) {
        let salgslinje = bestillingMap.get(product._id)
        salgslinje.antal++;
        salgslinje.samletPris = salgslinje.enhedsPris * salgslinje.antal;
    } else {
        let salgslinje = {
            antal: 1,
            navn: product.name,
            samletPris: product.price,
            enhedsPris: product.price,
            productId: product._id
        }
        bestillingMap.set(product._id, salgslinje)
    }

    createBestillingTable(bestillingMap);
}

function createBestillingTable(bestilling) {
    regningContent.innerHTML = '';
    for (const s of bestilling) {
        let salgslinje = s[1];
        let row = regningContent.insertRow();
        let cellName = row.insertCell();
        let cellAmount = row.insertCell();
        let cellPrice = row.insertCell();
        cellName.innerHTML = salgslinje.navn
        cellAmount.innerHTML = salgslinje.antal
        cellPrice.innerHTML = salgslinje.samletPris
    }
    udregnPris(bestilling)
}

function udregnPris(bestilling) {
    let sum = 0;

    for (const s of bestilling) {
        let salgslinje = s[1];
        sum += salgslinje.samletPris;
    }
    samletPrisInput.value = sum;
}

function generateBestillingTable(orders) {
    let html = ''
    for (order of orders) {
        html += '<tr id=' + order._id + '><td>' + order.table +
            '</td><td>' + order.price +
            '</td><td><button id="editButton">Edit</button></td><td><button id="deleteButton">X</button></td></tr>\n';
    }
    return html;
}

function lavRabatProcent() {
    let pris = Number(samletPrisInput.value);
    let rabatProcent = Number(document.getElementById('rabatProcent').value) / 100;
    if (document.getElementById('rabatProcent').value > 100) {
        let fejlBesked = document.getElementById("fejlRabat");
        fejlBesked.insertAdjacentHTML("afterend", "<p>Du kan ikke give så meget rabat!<br>Må ikke være mere end 100%.</p>");
    } else {
        let total = pris - (pris * rabatProcent);
        samletPrisInput.value = total;
    }
}

function lavRabatKroner() {
    let pris = Number(samletPrisInput.value);
    let rabatKroner = Number(document.getElementById('rabatKroner').value);
    if (document.getElementById('rabatKroner').value > pris) {
        let fejlBesked = document.getElementById("fejlRabat");
        fejlBesked.insertAdjacentHTML("afterend", "<p>Du kan ikke give så meget rabat!<br>Rabat kan ikke være mere end samlet pris.</p>");
    } else {
        let total = pris - rabatKroner;
        samletPrisInput.value = total;
    }
}

function sletSalgslinje(event) {
    event.currentTarget.parentElement.parentElement.parentElement.outerHTML = ""
    udregnPris()
}

async function opretHandler() {
    let bemærkningInput = document.getElementById('bemærkning')
    let time = Date.now();
    let table = bordSelect.value;
    let waiter = 'Per';
    let products = JSON.stringify(getRegning());
    let price = samletPrisInput.value;
    let comment = bemærkningInput.value;
    await post('/api/orders', { time, table, waiter, products, price, comment });
    printRegning(time, table, waiter, price, comment)
    samletPrisInput.value = ""
    bemærkningInput.value = ""
    bordSelect.value = 1
    rydRegning()
}


function getRegning() {
    let toReturn = [];
    for (let i = 1; i < regning.children.length; i++) {
        let j = regning.children[i].children[0];
        toReturn.push({ name: j.children[0].innerHTML, amount: j.children[1].children[0].value, price: j.children[2].innerHTML })
    }
    return toReturn;
}

async function generateOrdersModal() {
    try {
        orders = await get('/api/orders');
    } catch (fejl) {
        console.log(fejl);
    }

    orderTable.innerHTML = "<tr><th>Bord nr.</th><th>Samlet pris</th></tr>"
    orderTable.insertAdjacentHTML('beforeend', generateBestillingTable(orders));
    let editButtons = document.querySelectorAll('#editButton')
    Array.from(editButtons).forEach(element => {
        element.addEventListener('click', editOrderHandler)
    });
    let deleteButtons = document.querySelectorAll('#deleteButton')
    Array.from(deleteButtons).forEach(element => {
        element.addEventListener('click', deleteOrderHandler)
    });
}

async function saveEditOrderHandler(event) {
    let id = event.currentTarget.previousElementSibling.getAttribute("orderid")
    let table = editOrderTable.children[2]
    let products = [];
    for (let i = 0; i < table.children.length; i++) {
        products.push({ name: table.children[i].children[0].innerHTML, amount: table.children[i].children[1].children[0].value, price: table.children[i].children[2].innerHTML })
    }
    let productsString = JSON.stringify(products)
    let nySamletPris = editOrderTable.children[3].children[0].children[1].innerHTML
    let nyComment = editOrderTable.children[3].children[1].children[1].innerHTML
    let object = { products: productsString, price: nySamletPris, comment: nyComment }
    await post('/api/orders/update/' + id, object)
    editModal.style.display = "none"
    generateOrdersModal()
}

async function editOrderHandler(event) {
    editModal.style.display = "block"
    let id = event.currentTarget.parentElement.parentElement.id
    let orderToEdit;
    for (order of orders) {
        if (order._id === id) {
            orderToEdit = order
        }
    }
    editOrderTable.setAttribute("orderid", id)
    editOrderTable.innerHTML = "<thead><tr><th>Redigér regning</td></tr></thead><tr><td>Beskrivelse</td><td>Antal</td><td>Pris</td></tr>"
    editOrderTable.insertAdjacentHTML('beforeend', insertOrderRows(orderToEdit))

    let enkeltPriser = calcEnkeltPris(orderToEdit)
    let i = 0
    Array.from(document.querySelectorAll("#editAmount")).forEach(element => {
        element.addEventListener('input', editOrderPriceHandler.bind(event, enkeltPriser[i]));
        i++;
    })
    Array.from(document.querySelectorAll("#editPrice")).forEach(element => {
        element.addEventListener('input', updateSamletPrisEditOrder);
    })

}

function editOrderPriceHandler(pris) {
    let nyPris = parseInt(pris) * parseInt(event.currentTarget.value)
    event.currentTarget.parentElement.nextElementSibling.innerHTML = nyPris
    updateSamletPrisEditOrder()
}

function updateSamletPrisEditOrder() {
    let nySamletPris = 0;
    Array.from(document.querySelectorAll("#editPrice")).forEach(element => {
        if (element.value) {
            nySamletPris += parseInt(element.value)
        }
        else {
            nySamletPris += 0
        }
    })
    samletPrisInput.innerHTML = nySamletPris
}

function calcEnkeltPris(order) {
    let enkeltPriser = [];
    Array.from(JSON.parse(order.products)).forEach(element => {
        enkeltPriser.push(element.price / element.amount)
    })
    return enkeltPriser
}

async function deleteOrderHandler(event) {
    let id = event.currentTarget.parentElement.parentElement.id
    let proceed = confirm("Er du sikker på du vil slette?")
    if (proceed) {
        await deLete('/api/orders/' + id)
        generateOrdersModal()

    }
}

function insertOrderRows(order) {
    let html = ""
    Array.from(JSON.parse(order.products)).forEach(element => {

        html +=
            "<tr><td contenteditable=true>" + element.name +
            "</td><td><INPUT id='editAmount' TYPE='NUMBER' MIN='0' MAX='100' STEP='1' VALUE='" + element.amount + "' SIZE='6'></INPUT>" +
            "</td><td><input id='editPrice' value='" + element.price + "'></input></td></tr>"
    });
    html += "<tfoot><tr><td>Samlet pris</td><td id='editSamletPris' contenteditable=true>" + order.price + "</td></tr><tr><td>Bemærkning</td><td contenteditable=true>" + order.comment + "</td></tr></tfoot>"
    return html
}

function rydRegning() {
    regningContent.innerHTML = '';
    bestillingMap.clear();
    samletPrisInput.value = 0
}

function printRegning(time, table, waiter, price, comment) {
    let bong = getRegning()
    console.log('bord ' + table + ' ' + 'tid: ' + time);
    for (let i = 0; i < bong.length; i++) {
        console.log('Name: ' + bong[i].name + ' ' + 'Amount: ' + bong[i].amount + ' ' + 'Price: ' + bong[i].price)
    }
    console.log('kommentar: ' + comment)
    console.log('Total: ' + price + 'DK');
    console.log('din dejlige tjener: ' + waiter);

    borderModal.style.display = "block"
}

async function initialize() {
    try {
        products = await get('/api/products');
    } catch (fejl) {
        console.log(fejl);
    }
}

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

async function deLete(url) {
    let respons = await fetch(url, {
        method: "DELETE"
    });
    if (respons.status !== 200) // OK
        throw new Error(respons.status);
    return await respons.json();
}

async function main() {
    document.getElementById('opretButton').onclick = opretHandler
    document.getElementById('rydButton').onclick = rydRegning
    document.getElementById('saveButton').onclick = saveEditOrderHandler

    for (e of document.querySelectorAll("#close")) {
        e.onclick = function (event) {
            event.currentTarget.parentElement.parentElement.style.display = "none"
        }
    }

    window.onclick = function (event) {
        if (event.target === borderModal) {
            borderModal.style.display = "none";
        }
        if (event.target === editModal) {
            editModal.style.display = "none";
            borderModal.style.display = "block";
        }
    }

    document.getElementById('annuller').onclick = function () {
        borderModal.style.display = "none"
    }

    document.getElementById('hentborde').onclick = function () {
        generateOrdersModal()
        borderModal.style.display = "block"
    }
    await initialize();
    createProductTable();
}
main();