// const {controller} = require('../controller/Controller')????
var regningContent = document.getElementById('regningContent');
var bordSelect = document.getElementById('bordNr')
var regning = document.getElementById('regning')
var samletPrisInput = document.getElementById('samletPris')
var close = document.getElementById('close')
var borderModal = document.getElementById('bordeModal')
var editModal = document.getElementById('editModal')
var editOrderTable = document.getElementById('editOrder');
var orderTable = document.getElementById('orders');
var rabatKronerInput = document.getElementById('rabatKroner')
var rabatProcentInput = document.getElementById('rabatProcent')
var bemærkningInput = document.getElementById('bemærkning')
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

    row.onclick = () => addProductToBestilling(product)
}

function addProductToBestilling(product) {
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
    createBestillingTable();
}

function createBestillingTable() {
    regningContent.innerHTML = '';
    for (const s of bestillingMap) {
        let salgslinje = s[1];
        let row = regningContent.insertRow();

        let cellName = row.insertCell();
        cellName.innerHTML = salgslinje.navn

        let cellAmount = row.insertCell();
        let amountInput = document.createElement('input')
        amountInput.setAttribute('type', 'number')
        amountInput.value = salgslinje.antal;
        amountInput.style.maxWidth = '40px'
        amountInput.onchange = () => {
            salgslinje.antal = amountInput.value;
            salgslinje.samletPris = salgslinje.antal * salgslinje.enhedsPris
            createBestillingTable()
        }
        cellAmount.appendChild(amountInput);

        let cellPrice = row.insertCell();
        cellPrice.innerHTML = salgslinje.samletPris

        let deleteCell = row.insertCell();
        let imgDelete = document.createElement('img');
        imgDelete.src = '../img/slet.png'
        deleteCell.appendChild(imgDelete);

        deleteCell.onclick = () => {
            row.parentNode.removeChild(row)
            bestillingMap.delete(salgslinje.productId)
            createBestillingTable()
        }
    }
    udregnPris()
}

function udregnPris() {
    let sum = 0;

    for (const s of bestillingMap) {
        let salgslinje = s[1];
        sum += salgslinje.samletPris;
    }

    samletPrisInput.value = sum;
}


function lavRabatProcent() {
    let pris = samletPrisInput.value;
    let rabatProcent = rabatProcentInput.value / 100;
    if (rabatProcentInput.value > 100) {
        let fejlBesked = document.getElementById("fejlRabat");
        fejlBesked.insertAdjacentHTML("afterend", "<p>Du kan ikke give så meget rabat!<br>Må ikke være mere end 100%.</p>");
    } else {
        let total = pris - (pris * rabatProcent);
        samletPrisInput.value = total;
    }
}

function lavRabatKroner() {
    let pris = samletPrisInput.value;
    let rabatKroner = rabatKronerInput.value;
    if (rabatKronerInput.value > pris) {
        let fejlBesked = document.getElementById("fejlRabat");
        fejlBesked.insertAdjacentHTML("afterend", "<p>Du kan ikke give så meget rabat!<br>Rabat kan ikke være mere end samlet pris.</p>");
    } else {
        let total = pris - rabatKroner;
        samletPrisInput.value = total;
    }
}

async function opretBestilling() {
    let bestilling = {
        time: Date.now(),
        table: bordSelect.value,
        waiter: 'Per',
        products: JSON.stringify(bestillingMapToArray()),
        price: samletPrisInput.value,
        comment: bemærkningInput.value
    }
    console.log(await post('/api/orders', bestilling));
    printBestilling(bestilling)
    rydRegning()
}


function bestillingMapToArray() {
    let toReturn = [];
    for (const b of bestillingMap.values()) {
        toReturn.push(b)
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

function generateBestillingTable(orders) {
    let html = ''
    for (order of orders) {
        html += '<tr id=' + order._id + '><td>' + order.table +
            '</td><td>' + order.price +
            '</td><td><button id="editButton">Edit</button></td><td><button id="deleteButton">X</button></td></tr>\n';
    }
    return html;
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
    bemærkningInput.value = ""
    bordSelect.value = 1
}

function printBestilling(bestilling) {
    let salgslinjer = bestillingMapToArray()
    let toReturn = `Bord ${bestilling.table}, Tidspunkt: ${new Date(bestilling.time).toLocaleString()}\n\n`;
    
    for (let i = 0; i <salgslinjer.length; i++) {
        s = salgslinjer[i]
        toReturn += `Ret ${i+1}: ${s.navn} Mængde: ${s.antal} Pris: ${s.enhedsPris}\n`
    }
    
    toReturn += `\nBemærkning: ${bestilling.comment}\n`
    toReturn += `Total pris: ${bestilling.price}\n`
    toReturn += `Tjener: ${bestilling.waiter}\n`
    
    console.log(toReturn)
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
    if (!(respons.status == 200 || respons.status == 201)) // Created
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
    document.getElementById('opretButton').onclick = opretBestilling
    document.getElementById('rydButton').onclick = rydRegning
    document.getElementById('saveButton').onclick = saveEditOrderHandler
    document.getElementById('lavRabatKronerButton').onclick = lavRabatKroner
    document.getElementById('lavRabatProcentButton').onclick = lavRabatProcent

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