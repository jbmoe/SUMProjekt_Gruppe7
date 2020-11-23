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
    let rabatProcent = document.getElementById('rabatProcent').value;

    if (rabatProcent > 100 || rabatProcent < 1 || !rabatProcent) {
        alert('Rabatprocent skal være mellem 1 og 100')
    } else {
        let total = pris - (pris * rabatProcent / 100);
        samletPrisInput.value = total;
    }
    document.getElementById('rabatProcent').value = ''
}

function lavRabatKroner() {
    let pris = samletPrisInput.value;
    let rabatKroner = document.getElementById('rabatKroner').value;

    if (rabatKroner > pris || rabatKroner < 1 || !rabatKroner) {
        alert('Rabatkroner skal være mindst 1 kr og ikke over total pris!')
    } else {
        let total = pris - rabatKroner;
        samletPrisInput.value = total;
    }
    document.getElementById('rabatKroner').value = ''
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
    generateOrdersTable(orders)
}

function generateOrdersTable(orders) {
    let table = document.getElementById('ordersContent')
    table.innerHTML = ''
    for (const o of orders) {
        let row = table.insertRow();
        row.insertCell().innerHTML = o.table;
        row.insertCell().innerHTML = o.price;

        let cellEdit = row.insertCell();
        let editBtn = document.createElement('button');
        editBtn.innerHTML = 'Ændre'
        editBtn.onclick = () => editOrderHandler(o);
        cellEdit.appendChild(editBtn)

        let cellDelete = row.insertCell()
        let deleteBtn = document.createElement('img');
        deleteBtn.src = '../img/slet.png'
        deleteBtn.onclick = () => deleteOrder(o);
        cellDelete.appendChild(deleteBtn)
    }
}

async function editOrderHandler(order) {
    editModal.style.display = "block"

    let table = document.getElementById('editOrderContent');
    table.innerHTML = ''
    let salgslinjer = JSON.parse(order.products);

    for (const s of salgslinjer) {
        let row = table.insertRow();

        row.insertCell().innerHTML = s.navn

        let cellAntal = row.insertCell();
        let antalInput = document.createElement('input');
        antalInput.setAttribute('type', 'number')
        antalInput.setAttribute('min', '1')
        antalInput.value = s.antal;
        antalInput.style.maxWidth = '30px'
        antalInput.onchange = () => {
            samletPrisInput.value = samletPrisInput.value - cellPris.innerHTML
            s.antal = antalInput.value;
            s.samletPris = s.antal * s.enhedsPris;
            cellPris.innerHTML = s.samletPris;
            samletPrisInput.value = parseInt(samletPrisInput.value) + parseInt(cellPris.innerHTML)
        }
        cellAntal.appendChild(antalInput)

        let cellPris = row.insertCell();
        cellPris.innerHTML = s.samletPris;

        let cellDelete = row.insertCell();
        let deleteBtn = document.createElement('img')
        deleteBtn.onclick = () => {
            samletPrisInput.value -= cellPris.innerHTML
            salgslinjer.splice(salgslinjer.indexOf(s), 1)
            row.parentNode.removeChild(row)
        }
        deleteBtn.src = '../img/slet.png'
        cellDelete.appendChild(deleteBtn)
    }

    let samletPrisRow = table.insertRow();
    samletPrisRow.insertCell().innerHTML = 'Samlet pris';

    let waiterRow = table.insertRow()
    waiterRow.insertCell().innerHTML = 'Tjener'
    waiterRow.insertCell() // Emtpy cell for looks
    waiterRow.insertCell().innerHTML = order.waiter;

    let samletPrisInput = document.createElement('input')
    samletPrisInput.setAttribute('type', 'number')
    samletPrisInput.setAttribute('min', '0')
    samletPrisInput.value = order.price
    samletPrisInput.style.maxWidth = '50px'
    samletPrisRow.insertCell() // Emtpy cell for looks
    samletPrisRow.insertCell().appendChild(samletPrisInput);

    let bemærkningRow = table.insertRow();
    bemærkningRow.insertCell().innerHTML = 'Bemærkning'

    let bemærkningInput = document.createElement('input')
    bemærkningInput.value = order.comment;
    bemærkningInput.style.width = '96%'

    let bemærkningCell = bemærkningRow.insertCell();
    bemærkningCell.setAttribute('colspan', '2')
    bemærkningCell.appendChild(bemærkningInput)

    document.getElementById('saveButton').onclick = () => updateOrder(order, salgslinjer, samletPrisInput.value, bemærkningInput.value)
}

async function updateOrder(order, salgslinjer, samletPris, bemærkning) {
    let opdateretBestilling = {
        products: JSON.stringify(salgslinjer),
        price: samletPris,
        comment: bemærkning
    }
    console.log(await post('/api/orders/update/' + order._id, opdateretBestilling))
    editModal.style.display = "none"
    generateOrdersModal()
}

async function deleteOrder(order) {
    let proceed = confirm("Er du sikker på du vil slette?")
    if (proceed) {
        await deLete('/api/orders/' + order._id)
        generateOrdersModal()
    }
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

    for (let i = 0; i < salgslinjer.length; i++) {
        s = salgslinjer[i]
        toReturn += `Ret ${i + 1}: ${s.navn} Mængde: ${s.antal} Pris: ${s.enhedsPris}\n`
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
    document.getElementById('saveButton').onclick = updateOrder
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