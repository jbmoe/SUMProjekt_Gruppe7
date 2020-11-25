var opretButton = document.getElementById('opretButton')
var rydButton = document.getElementById('rydButton')
var bordSelect = document.getElementById('bordNr')
var bemærkningInput = document.getElementById('bemærkning')
var regning = document.getElementById('regning')
var samletPrisInput = document.getElementById('samletPris')
var borderKnap = document.getElementById('hentborde')
var annullerKnap = document.getElementById('annuller')
var close = document.getElementById('close')
var borderModal = document.getElementById('bordeModal')
var editModal = document.getElementById('editModal')
var betalModal = document.getElementById('betalModal')
var closeElements = document.querySelectorAll("#close");
var gemKnap = document.getElementById('saveButton')
var editOrderTable = document.getElementById('editOrder');
var betalOrderTable = document.getElementById('betalOrder')
var productModal = document.getElementById('addProductModal')
var betalKnap = document.getElementById('betalButton')
let adminTab = document.getElementById('admin')
let bestillingTab = document.getElementById('bestilling')
var editButtons;
var deleteButtons;
var products;
var orderTable;
var betalbutton; 

opretButton.onclick = opretHandler
rydButton.onclick = rydRegning
gemKnap.onclick = saveEditOrderHandler



for (e of closeElements) {
    e.onclick = function (event) {
        event.currentTarget.parentElement.parentElement.style.display = "none"
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
    // if (respons.status !== 200) // Created
    //     throw new Error(respons.status);
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


function generateProductTable(products) {
    let html = '<table><tr><th>Beskrivelse</th><th>Pris</th></tr>';
    for (product of products) {
        html += '<tr id="product"><td>' + product.name +
            '</td><td>' + product.price +
            '</td></tr>\n';
    }   
    html += '</table>';
    return html;
}

function generateBestillingTable(orders) {
    let html = ''
    for (order of orders) {
        html += '<tr id=' + order._id + '><td>' + order.table +
            '</td><td>' + order.price +
            '</td><td><button id="editButton">Edit</button></td><td><button id="deleteButton">X</button></td><td><button id="betalbutton">Betal</button></td></td>\n';
    }
    return html;
}


function samletPris() {
    let priser = regning.children
    let samletPris = 0;
    for (let i = 1; i < priser.length; i++) {
        samletPris += parseInt(priser[i].children[0].children[2].innerHTML)
    }
    samletPrisInput.value = samletPris
}

function lavRabatProcent() {
    let pris = Number(document.getElementById('samletPris').value);
    let rabatProcent = Number(document.getElementById('rabatProcent').value) / 100;
    if (document.getElementById('rabatProcent').value > 100) {
        let fejlBesked = document.getElementById("fejlRabat");
        fejlBesked.insertAdjacentHTML("afterend", "<p>Du kan ikke give så meget rabat!<br>Må ikke være mere end 100%.</p>");
    } else {
        let total = pris - (pris * rabatProcent);
        document.getElementById('samletPris').value = total;
    }
}

function lavRabatKroner() {
    let pris = Number(document.getElementById('samletPris').value);
    let rabatKroner = Number(document.getElementById('rabatKroner').value);
    if (document.getElementById('rabatKroner').value > pris) {
        let fejlBesked = document.getElementById("fejlRabat");
        fejlBesked.insertAdjacentHTML("afterend", "<p>Du kan ikke give så meget rabat!<br>Rabat kan ikke være mere end samlet pris.</p>");
    } else {
        let total = pris - rabatKroner;
        document.getElementById('samletPris').value = total;
    }
}

function productHandler(event) {
    let pAntal;
    let pNavn = event.currentTarget.children[0].innerHTML;
    let pPris = event.currentTarget.children[1].innerHTML;
    let found = false;
    let enkeltPris;
    let foundElement;
    let i = 1;

    while (!found && i < regning.children.length) {
        if (regning.children[i].children[0].children[0].innerHTML === pNavn) {
            foundElement = regning.children[i].children[0]
            pAntal = parseInt(foundElement.children[1].children[0].value)
            found = true
        }
        i++;
    }
    enkeltPris = parseInt(pPris)
    if (found) {
        addSalgslinje(foundElement, enkeltPris, pAntal)
    }
    else {
        regning.insertAdjacentHTML('beforeend', '<tr><td>' + pNavn + "</td>" + '<td><INPUT TYPE="NUMBER" MIN="0" MAX="100" STEP="1" VALUE="1" SIZE="6"></INPUT></td> <td>' + pPris + '</td><td><button>X</button></td></tr>')
        regning.children[regning.children.length - 1].children[0].children[1].children[0].addEventListener('input', updateSalgslinje.bind(event, enkeltPris))
        regning.children[regning.children.length - 1].children[0].children[3].children[0].addEventListener('click', sletSalgslinje)
    }
    samletPris()
}

function updateSalgslinje(enkeltPris, event) {
    let antal = event.currentTarget.value;
    let prisCell = event.currentTarget.parentElement.nextElementSibling;
    let nyPris = antal * enkeltPris;
    prisCell.innerHTML = nyPris;
    samletPris();
}

function addSalgslinje(element, pris, antal) {
    let nyAntal = antal + 1
    let nyPris = pris * nyAntal
    element.children[1].children[0].setAttribute('value', nyAntal);
    element.children[2].innerHTML = nyPris
    samletPris()
}

function sletSalgslinje(event) {
    event.currentTarget.parentElement.parentElement.parentElement.remove()
    samletPris()
}

async function opretHandler() {
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

function rydRegning() {
    regning.innerHTML = '<tr><th>Beskrivelse</th><th>Antal</th><th>Pris</th></tr>';
    samletPrisInput.value = 0
}

function getRegning() {
    let toReturn = [];
    for (let i = 1; i < regning.children.length; i++) {
        let j = regning.children[i].children[0];
        toReturn.push({ name: j.children[0].innerHTML, amount: j.children[1].children[0].value, price: j.children[2].innerHTML })
    }
    return toReturn;
}

async function main() {
    try {
        products = await get('/api/products');
    } catch (fejl) {
        console.log(fejl);
    }
    document.getElementById('produkter').innerHTML = generateProductTable(products);
    let trs = document.querySelectorAll("#product")
    for (tr of trs)
        tr.onclick = productHandler;
}
main();


async function generateOrdersModal() {
    try {
        orders = await get("/api/orders");
    } catch (fejl) {
        console.log(fejl);
    }

    orderTable = document.getElementById('orders');
    orderTable.innerHTML = "<tr><th>Bord nr.</th><th>Samlet pris</th></tr>"
    orderTable.insertAdjacentHTML('beforeend', generateBestillingTable(orders));
    editButtons = document.querySelectorAll('#editButton')
    Array.from(editButtons).forEach(element => {
        element.addEventListener('click', editOrderHandler)
    });
    deleteButtons = document.querySelectorAll('#deleteButton')
    Array.from(deleteButtons).forEach(element => {
        element.addEventListener('click', deleteOrderHandler)
    });
    betalbutton = document.querySelectorAll('#betalbutton')
    Array.from(betalbutton).forEach(element => {
        element.addEventListener('click', betalOrderModalHandler)
    })
}


async function saveEditOrderHandler(event) {
    let id = event.currentTarget.previousElementSibling.getAttribute("orderid")
    let table = editOrderTable.children[2]
    let products = [];
    for (let i = 0; i < table.children.length; i++) {
        products.push({ name: table.children[i].children[0].innerHTML, amount: table.children[i].children[1].children[0].value, price: table.children[i].children[2].children[0].value })
    }
    let productsString = JSON.stringify(products)
    let nySamletPris = editOrderTable.children[3].children[0].children[1].innerHTML
    let nyComment = editOrderTable.children[3].children[1].children[1].innerHTML
    let object = { products: productsString, price: nySamletPris, comment: nyComment }
    await post('/api/orders/update/' + id, object)
    editModal.style.display = "none"
    generateOrdersModal()
}


async function betalOrderModalHandler(event) {
    betalModal.style.display = "block"
    let id = event.currentTarget.parentElement.parentElement.id
    let orderToBetal;
    for (order of orders) {
        if(order._id === id) {
            orderToBetal = order
        }
    }
    betalOrderTable.setAttribute("orderid", id)
    betalOrderTable.innerHTML = "<thead><tr><th>Betal Regning:</td></tr></thead><tr><td>Beskrivelse</td><td>Antal</td><td>Pris</td></tr>"
    betalOrderTable.insertAdjacentHTML('beforeend', insertOrderRows(orderToBetal))
    betalKnap.addEventListener('click', betalOrderHandler.bind(orderToBetal))

}

async function betalOrderHandler(){
    let order = this
    let paymentMethod = document.getElementById('betaling').value
    await post('/api/orders/payment', {order, paymentMethod})
    await deLete('/api/orders/'+this._id)
    betalModal.style.display = "none"
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
    editOrderTable.innerHTML = "<thead><tr><th>Redigér regning</td><td><button id='addProductButton'>Tilføj produkt</button></td></tr></thead><tr><td>Beskrivelse</td><td>Antal</td><td>Pris</td></tr>"
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
    Array.from(document.querySelectorAll("#deleteProductButton")).forEach(element => {
        element.addEventListener('click', deleteProductHandler);
    })
    document.getElementById("addProductButton").addEventListener('click', addProductModal)

}


function editOrderPriceHandler(pris) {
    let nyPris = parseInt(pris) * parseInt(event.currentTarget.value)
    event.currentTarget.parentElement.nextElementSibling.children[0].value = nyPris
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
    document.getElementById('editSamletPris').innerHTML = nySamletPris
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

function deleteProductHandler(event) {
    event.currentTarget.parentElement.parentElement.remove()
}

function addProductModal() {
    productModal.style.display = "block"
    let table = document.getElementById("addProduct")
    table.innerHTML = generateProductTable(products)
    let rows = table.rows
    for (let i = 1; i < rows.length; i++) {
        rows[i].addEventListener('click', addProductHandler.bind(event, rows[i].children[0].innerHTML))
    }
    console.log("test")
}

function addProductHandler(productName) {
    let proceed = confirm("Vil du tilføje \"" + productName + "\" til bestillingen?")
    if (proceed) {
        let enkeltPris = 0
        products.forEach(element => {
            if (element.name === productName) {
                enkeltPris = element.price
            }
        })

        let amountInput = document.createElement("input")
        amountInput.type = "Number"
        amountInput.size = "6"
        amountInput.min = "0"
        amountInput.max = "100"
        amountInput.value = 1
        amountInput.addEventListener('input', editOrderPriceHandler.bind(event, enkeltPris));

        let priceInput = document.createElement("input")
        priceInput.value = enkeltPris
        priceInput.id = "editPrice"
        priceInput.addEventListener('input', updateSamletPrisEditOrder);

        let deleteButton = document.createElement("button")
        deleteButton.innerHTML = "X"
        deleteButton.addEventListener('click', deleteProductHandler);

        let newRow = editOrderTable.children[2].insertRow()
        newRow.insertCell(0).innerHTML = productName
        newRow.insertCell(1).appendChild(amountInput)
        newRow.insertCell(2).appendChild(priceInput)
        newRow.insertCell(3).appendChild(deleteButton)

        updateSamletPrisEditOrder()
    }

    productModal.style.display = "none"
}

function insertOrderRows(order) {
    let html = ""
    Array.from(JSON.parse(order.products)).forEach(element => {

        html +=
            "<tr><td>" + element.name +
            "</td><td><INPUT id='editAmount' TYPE='NUMBER' MIN='0' MAX='100' STEP='1' VALUE='" + element.amount + "' SIZE='6'></INPUT>" +
            "</td><td><input id='editPrice' value='" + element.price + "'></input></td><td><button id='deleteProductButton'>X</button></td></tr>"
    });
    html += "<tfoot><tr><td>Samlet pris</td><td id='editSamletPris' contenteditable=true>" + order.price + "</td></tr><tr><td>Bemærkning</td><td contenteditable=true>" + order.comment + "</td></tr></tfoot>"
    return html
}


annullerKnap.onclick = function () {
    borderModal.style.display = "none"
}


borderKnap.onclick = function () {
    generateOrdersModal()
    borderModal.style.display = "block"
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
}

window.onclick = function (event) {
    if (event.target === borderModal) {
        borderModal.style.display = "none";
    }
    if (event.target === editModal) {
        editModal.style.display = "none";
    }
    if (event.target === productModal) {
        productModal.style.display = "none"
    }
}

adminTab.addEventListener('click', function(){
    window.location.href = '/api/orders'
}, false)

