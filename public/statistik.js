var table = document.getElementById('tableContent')
// var datoTable = document.getElementById('dateContent')
// var periodeTable = document.getElementById('periodContent')
var datePicker = document.getElementById('date')
var periodStartPicker = document.getElementById('periodStart')
var periodEndPicker = document.getElementById('periodEnd')
var radios = document.getElementsByName('group')
var tableInfos = document.getElementsByName('tableInfo')
var orders = []

function fillTable(statArr) {
    table.innerHTML = ''
    for (const e of statArr[0]) {
        let row = table.insertRow();
        row.insertCell().innerHTML = e.product
        row.insertCell().innerHTML = e.amount
        row.insertCell().innerHTML = e.sum
        row.insertCell().innerHTML = e.category
    }
    // Indsætter række nederst i tabellen med samlet oversigt 
    let footer = table.parentElement.querySelector('tfoot')
    footer.innerHTML = ''
    let row = footer.insertRow()
    row.insertCell().innerHTML = 'Samlet salg'
    row.insertCell().innerHTML = statArr[1]
    row.insertCell().innerHTML = statArr[2]
    table.parentElement.appendChild(footer)
}

/**
 * Finder hyppigheden af produkter i oprettede ordrer på en given dato 
 * @param {Date} date dato der ønskes statistk for 
 * @param {*} category kategorien af produkter der skal laves statistik på. Hvis alle kategorier ønskes, angives 'Alle'
 */
function statForPeriod(category, d1, d2) {
    let freqMap = new Map()
    let sum = 0, count = 0;
    let date1 = new Date(d1)
    let date2 = new Date(d2)

    for (const o of orders) {
        let orderD = new Date(o.time)
        if (orderD >= date1 && orderD <= date2) {
            let products = JSON.parse(o.products)
            for (const p of products) {
                if (freqMap.has(p.productId)) {
                    let entry = freqMap.get(p.productId)
                    sum -= entry.amount * p.enhedsPris
                    count -= entry.amount

                    entry.amount += p.antal
                    entry.sum = entry.amount * p.enhedsPris

                    sum += entry.amount * p.enhedsPris
                    count += entry.amount
                } else if (p.kategori === category || category === 'Alle') {
                    let entry = {
                        product: p.navn,
                        amount: p.antal,
                        category: p.kategori,
                        sum: p.antal * p.enhedsPris
                    }
                    sum += entry.sum;
                    count += entry.amount;
                    freqMap.set(p.productId, entry)
                }
            }
        }
    }
    return [Array.from(freqMap.values()), count, sum];
}

/**
 * Finder hyppigheden af produkter i oprettede ordrer på en given dato 
 * @param {Date} date dato der ønskes statistk for 
 * @param {*} category kategorien af produkter der skal laves statistik på. Hvis alle kategorier ønskes, angives 'Alle'
 */
function statForDate(category, date) {
    let freqMap = new Map()
    let sum = 0, count = 0;
    for (const o of orders) {
        let orderD = new Date(o.time)
        if (orderD.getDate() == date.getDate() && orderD.getMonth() == date.getMonth() && orderD.getFullYear() == date.getFullYear()) {
            let products = JSON.parse(o.products)
            for (const p of products) {
                if (freqMap.has(p.productId)) {
                    let entry = freqMap.get(p.productId)
                    sum -= entry.amount * p.enhedsPris
                    count -= entry.amount

                    entry.amount += p.antal
                    entry.sum = entry.amount * p.enhedsPris

                    sum += entry.amount * p.enhedsPris
                    count += entry.amount
                } else if (p.kategori === category || category === 'Alle') {
                    let entry = {
                        product: p.navn,
                        amount: p.antal,
                        category: p.kategori,
                        sum: p.antal * p.enhedsPris
                    }
                    sum += entry.sum;
                    count += entry.amount;
                    freqMap.set(p.productId, entry)
                }
            }
        }
    }
    return [Array.from(freqMap.values()), count, sum];
}

/**
 * Finder hyppigheden af produkter i oprettede ordrer
 * @param {String} category kategorien af produkter der skal laves statistik på. Hvis alle kategorier ønskes, angives 'Alle'
 */
function freqStat(category) {
    let freqMap = new Map();
    let sum = 0, count = 0;
    for (const o of orders) {
        let products = JSON.parse(o.products)
        for (const p of products) {
            if (freqMap.has(p.productId)) {
                let entry = freqMap.get(p.productId)
                sum -= entry.amount * p.enhedsPris
                count -= entry.amount

                entry.amount += p.antal
                entry.sum = entry.amount * p.enhedsPris

                sum += entry.amount * p.enhedsPris
                count += entry.amount
            } else if (p.kategori === category || category === 'Alle') {
                let entry = {
                    product: p.navn,
                    amount: p.antal,
                    category: p.kategori,
                    sum: p.antal * p.enhedsPris
                }
                sum += entry.sum;
                count += entry.amount;
                freqMap.set(p.productId, entry)
            }
        }
    }
    return [Array.from(freqMap.values()), count, sum];
}

/**
 * Function til at sortere table, og ja har selv lavet den *wink wink* (:
 * @param {Number} n 
 */
function sortTable(n) {
    var rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    rows = table.rows;
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 0; i < rows.length - 1; i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            // console.log(x,y)
            /* Check if the two rows should switch place,
            based on the direction, asc or desc: */
            if (dir == "asc") {
                if (n == 0 && x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                } else if (n != 0 && parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (n == 0 && x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                } else if (n != 0 && parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            /* If a switch has been marked, make the switch
            and mark that a switch has been done: */
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // Each time a switch is done, increase this count by 1:
            switchcount++;
        } else {
            /* If no switching has been done AND the direction is "asc",
            set the direction to "desc" and run the while loop again. */
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

async function initialize() {
    try {
        orders = await get('bestilling/api');
    } catch (fejl) {
        console.log(fejl);
    }
}

function hideTableInfo() {
    for (let i = 0; i < tableInfos.length; i++) {
        tableInfos[i].style.display = 'none'
    }
}

async function get(url) {
    const respons = await fetch(url);
    if (respons.status !== 200) // OK
        throw new Error(respons.status);
    return await respons.json();
}

async function main() {
    await initialize()

    let headlines = ['Samletsalg', 'Samlet salg for dag', 'Samlet salg for periode']
    for (let i = 0; i < radios.length; i++) {
        radios[i].onchange = () => {
            hideTableInfo();
            document.getElementById('tableHeadline').innerHTML = headlines[i]
            document.getElementById('kategori').value = 'Alle'
            tableInfos[i].style.display = 'block'
            if (i == 0) fillTable(freqStat('Alle'))
            else if (i == 1) fillTable(statForDate('Alle', new Date(datePicker.value)))
            else fillTable(statForPeriod('Alle', new Date(periodStartPicker.value), new Date(periodEndPicker.value)))
        }
    }

    hideTableInfo()
    tableInfos[0].style.display = 'block'
    document.getElementById('tableHeadline').innerHTML = headlines[0]

    datePicker.value = new Date().toISOString().slice(0, 10);
    datePicker.onchange = () => {
        fillTable(statForDate('Alle', new Date(datePicker.value)))
    }

    let date2 = new Date()
    let date1 = new Date()
    date1.setDate(date2.getDate() - 7)

    periodStartPicker.value = date1.toISOString().slice(0, 10) + "T" + date1.toTimeString().slice(0, 5)
    periodStartPicker.onchange = () => {
        fillTable(statForPeriod('Alle', periodStartPicker.value, periodEndPicker.value))
    }

    periodEndPicker.value = date2.toISOString().slice(0, 10) + "T" + date2.toTimeString().slice(0, 5)
    periodEndPicker.onchange = () => {
        fillTable(statForPeriod('Alle', periodStartPicker.value, periodEndPicker.value))
    }

    let theads = document.getElementsByClassName('statAttribut')
    for (let i = 0; i < theads.length; i++) {
        const element = theads[i];
        element.onclick = () => sortTable(i % 3)
    }

    let select = document.getElementById('kategori')
    select.onchange = () => {
        let i = (Array.from(radios).find(e => e.checked == true)).value
        if (i == 1) fillTable(freqStat(select.value))
        else if (i == 2) fillTable(statForDate(select.value, new Date(datePicker.value)))
        else fillTable(statForPeriod(select.value, new Date(periodStartPicker.value), new Date(periodEndPicker.value)))
    }

    fillTable(freqStat('Alle'))
}
main()