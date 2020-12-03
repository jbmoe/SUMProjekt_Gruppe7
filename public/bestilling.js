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
var kategoriSelect = document.getElementById('kategori')
var productTable = document.getElementById('productTableContent')
var adminTab = document.getElementById('admin')
var logoutTab = document.getElementById('logout')
var bordNrSelect = document.getElementById('bordNr')
var products = [];
var orders = [];
var selectedToSplit = [];
var bestillingMap = new Map();

function createProductTable(products) {
    productTable.innerHTML = ''
    for (const p of products) {
        insertProductRow(p)
    }
}

function insertProductRow(product) {
    var row = productTable.insertRow();

    var data = [product.name, product.price, product.category];
    for (let i = 0; i < 3; i++) {
        let cell = row.insertCell(i);
        cell.innerHTML = data[i];
    }

    row.onclick = () => addProductToBestilling(product)
}

async function showProductsByCat(category) {
    if (category === 'Alle') {
        createProductTable(products)
    } else {
        let productsCat = [];

        for (const p of products) {
            if (p.category === category) productsCat.push(p)
        }

        createProductTable(productsCat)
    }
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
            kategori: product.category,
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
            salgslinje.antal = parseInt(amountInput.value);
            salgslinje.samletPris = salgslinje.antal * salgslinje.enhedsPris
            createBestillingTable()
        }
        cellAmount.appendChild(amountInput);
        cellAmount.setAttribute('class', 'narrow')

        let cellPrice = row.insertCell();
        cellPrice.innerHTML = salgslinje.samletPris
        cellPrice.setAttribute('class', 'narrow')

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
    let pris = parseInt(samletPrisInput.value);
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
    let pris = parseInt(samletPrisInput.value);
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
    console.log(await post('/bestilling', bestilling));
    printBestilling(bestilling)
    rydRegning()
    orders.push(bestilling)
    refreshBordNr()
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
        orders = await get('/bestilling/api');
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

    document.getElementById('addProduct').onclick = () => addProductToOrder(order)

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
        antalInput.value = parseInt(s.antal);
        antalInput.style.maxWidth = '30px'
        antalInput.onchange = () => {
            samletPrisInput.value = samletPrisInput.value - cellPris.innerHTML
            s.antal = parseInt(antalInput.value);
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

        let cellSplit = row.insertCell();
        let splitCheckbox = document.createElement('input')
        splitCheckbox.setAttribute('type', 'checkbox')
        splitCheckbox.onclick = () => selectToSplit(s, splitCheckbox.checked)
        cellSplit.appendChild(splitCheckbox)
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

    document.getElementById('saveButton').onclick = async () => {
        let additions = await findAdditions(order._id, salgslinjer)
        printAdditions(order, additions)
        updateOrder(order, salgslinjer, samletPrisInput.value, bemærkningInput.value)
    }

    document.getElementById('betalButton').onclick = () => betalOrder(order)

    document.getElementById('opdelButton').onclick = () => opdelRegning(order)
}

async function findAdditions(orderID, newProducts) {
    let oldOrder = await get('/bestilling/api/' + orderID)
    let oldProducts = JSON.parse(oldOrder.products)
    let toReturn = []

    for (const p of newProducts) {
        let found = false
        let i = 0;
        while (!found && i < oldProducts.length) {
            let e = oldProducts[i]
            if (e.productId == p.productId) found = true;
            else i++
        }
        let e = oldProducts[i]
        if (found && p.antal > e.antal) {
            let addition = {
                name: p.navn,
                amount: p.antal - e.antal,
                category: p.kategori,
                price: p.enhedsPris * p.antal
            }
            toReturn.push(addition)
        }
        else if (!found) {
            let addition = {
                name: p.navn,
                amount: p.antal,
                category: p.kategori,
                price: p.enhedsPris * p.antal
            }
            toReturn.push(addition)
        }
    }
    return toReturn;
}

function printAdditions(order, newProducts) {
    if (newProducts.length == 0) return

    let toPrint = `*************TILFØJELSER*************\nBord ${order.table}, Tidspunkt: ${new Date(order.time).toLocaleString()}\n\n`;

    for (let i = 0; i < newProducts.length; i++) {
        s = newProducts[i]
        toPrint += `Ret ${i + 1}: ${s.name} Mængde: ${s.amount} Pris: ${s.price}\n`
    }

    toPrint += `\nBemærkning: ${order.comment}\n`
    toPrint += `Total pris: ${order.price}\n`
    toPrint += `Tjener: ${order.waiter}\n`

    console.log(toPrint)
}

function addProductToOrder(order) {
    document.getElementById('addProductModal').style.display = "block"
    let table = document.getElementById("addProductContent")
    table.innerHTML = '';

    for (const p of products) {
        var row = table.insertRow();
        var data = [p.name, p.price, p.category];
        for (let i = 0; i < 3; i++) {
            let cell = row.insertCell(i);
            cell.innerHTML = data[i];
        }
        row.onclick = () => addProductHandler(order, p)
    }
}

function addProductHandler(order, product) {
    let proceed = confirm(`Vil du tilføje ${product.name} til bestillingen?`)
    if (proceed) {
        let products = JSON.parse(order.products)
        let found = false, i = 0;
        while (i < products.length && !found) {
            if (products[i].productId === product._id) found = true;
            else i++;
        }

        if (found) products[i].antal++
        else {
            let salgslinje = {
                antal: 1,
                navn: product.name,
                kategori: product.category,
                samletPris: product.price,
                enhedsPris: product.price,
                productId: product._id
            }
            products.push(salgslinje)
        }
        order.products = JSON.stringify(products)
        order.price += product.price
    }
    editOrderHandler(order)
    document.getElementById('addProductModal').style.display = "none"
}

async function updateOrder(order, salgslinjer, samletPris, bemærkning) {
    let opdateretBestilling = {
        products: JSON.stringify(salgslinjer),
        price: samletPris,
        comment: bemærkning
    }
    console.log(await post('/bestilling/update/' + order._id, opdateretBestilling))
    editModal.style.display = "none"
    generateOrdersModal()
}

async function deleteOrder(order) {
    if (confirm("Er du sikker på du vil slette bestillingen?")) {
        console.log(await deLete('bestilling/' + order._id))
        generateOrdersModal()
    }
}


async function betalOrder(order) {
    let paymentMethod = document.getElementById('betaling').value
    if (confirm(`Er du sikker på du vil tilknytte betaling og afslutte bestillingen?\nDen vil blive flyttet til betalte bestillinger under Admin`)) {
        console.log(await post('/bestilling/payment', { order, paymentMethod }))
        editModal.style.display = "none"
        generateOrdersModal()
    }
    orders.splice(order)
    refreshBordNr()
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

async function opdelRegning(order) {
    let samletPris = 0;
    for (s of selectedToSplit) {
        samletPris += parseInt(s.samletPris)
    }

    let bestilling = {
        time: order.time,
        table: order.table,
        waiter: order.waiter,
        products: JSON.stringify(selectedToSplit),
        price: samletPris,
        comment: order.comment
    }

    let paymentMethod = document.getElementById('betaling').value
    if (confirm(`Er du sikker på du vil tilknytte betaling og afslutte bestillingen?\nDen vil blive flyttet til betalte bestillinger under Admin`)) {
        let newOrder = await post('/bestilling', bestilling)
        let order = JSON.stringify(newOrder.createdOrder)
        await post('/bestilling/payment', { order, paymentMethod })
    }
}

function selectToSplit(salgslinje, checked) {
    if (!selectedToSplit.includes(salgslinje) && checked) {
        selectedToSplit.push(salgslinje)
    }
    else if (selectedToSplit.includes && !checked) {
        selectedToSplit.splice(salgslinje)
    }
    console.log(selectedToSplit)
}

function refreshBordNr() {
    let takenTables = [];
    for (order of orders) {
        takenTables.push(parseInt(order.table))
    }
    bordNrSelect.innerHTML = ""

    for (let i = 1; i <= 100; i++) {
        if (!takenTables.includes(i)) {
            let option = document.createElement('option')
            option.value = i
            option.text = i
            bordNrSelect.appendChild(option)
        }
    }
}

async function initialize() {
    try {
        products = await get('/api/products');
        orders = await get('/bestilling/api');
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
    // console.log(objekt)
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
    document.getElementById('lavRabatKronerButton').onclick = lavRabatKroner
    document.getElementById('lavRabatProcentButton').onclick = lavRabatProcent


    for (e of document.querySelectorAll("#close")) {
        e.onclick = function (event) {
            event.currentTarget.parentElement.parentElement.style.display = "none"
        }
    }

    kategoriSelect.onchange = () => showProductsByCat(kategoriSelect.value)

    window.onclick = function (event) {
        if (event.target === borderModal) {
            borderModal.style.display = "none";
        }
        if (event.target === editModal) {
            editModal.style.display = "none";
            borderModal.style.display = "block";
        }
    }

    document.getElementById('admin').onclick = () => window.location.href = '/admin'
    document.getElementById('logout').onclick = () => {
        window.location.href = '/logout'
    }

    document.getElementById('annuller').onclick = function () {
        borderModal.style.display = "none"
    }

    document.getElementById('hentborde').onclick = function () {
        generateOrdersModal()
        borderModal.style.display = "block"
    }
    await initialize();
    createProductTable(products);
    refreshBordNr()
}
main();