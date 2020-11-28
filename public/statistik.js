var statistikTable = document.getElementById('salgcontent')
var orders = []

function fillTable(arr) {
    for (const e of arr) {
        let row = statistikTable.insertRow();
        row.insertCell().innerHTML = e.product
        row.insertCell().innerHTML = e.amount
        row.insertCell().innerHTML = e.sum
    }
}

function statByDate(date) {
    let freqMap = new Map()

    let d = new Date(date)
    console.log(d)
    for (const o of orders) {
        let orderD = new Date(o.time)
        console.log(orderD)
        if (orderD.getDate() == d.getDate() && orderD.getMonth() == d.getMonth() && orderD.getFullYear() == d.getFullYear()) {
            let products = JSON.parse(o.products)
            for (const p of products) {
                if (freqMap.has(p.productId)) {
                    let entry = freqMap.get(p.productId)
                    entry.amount += p.antal
                    entry.sum = entry.amount * p.enhedsPris
                } else {
                    let entry = {
                        product: p.navn,
                        amount: p.antal,
                        sum: p.antal * p.enhedsPris
                    }
                    freqMap.set(p.productId, entry)
                }
            }
        }
    }
    return Array.from(freqMap.values());
}

function freqStat() {
    let freqMap = new Map()
    for (const o of orders) {
        let products = JSON.parse(o.products)
        for (const p of products) {
            if (freqMap.has(p.productId)) {
                let entry = freqMap.get(p.productId)
                entry.amount += p.antal
                entry.sum = entry.amount * p.enhedsPris
            } else {
                let entry = {
                    product: p.navn,
                    amount: p.antal,
                    sum: p.antal * p.enhedsPris
                }
                freqMap.set(p.productId, entry)
            }
        }
    }
    return Array.from(freqMap.values());
}

/**
 * Function til at sortere table, og ja har selv lavet den *wink wink* (:
 * @param {Number} n 
 */
function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = statistikTable;
    switching = true;
    // Set the sorting direction to ascending:
    dir = "asc";
    /* Make a loop that will continue until
    no switching has been done: */
    while (switching) {
        // Start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        /* Loop through all table rows (except the
        first, which contains table headers): */
        for (i = 0; i < (rows.length - 1); i++) {
            // Start by saying there should be no switching:
            shouldSwitch = false;
            /* Get the two elements you want to compare,
            one from current row and one from the next: */
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            /* Check if the two rows should switch place,
            based on the direction, asc or desc: */
            if (dir == "asc") {
                if (n != 2 && x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                } else if (n == 2 && parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (n != 2 && x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    // If so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                } else if (n == 2 && parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
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

async function get(url) {
    const respons = await fetch(url);
    if (respons.status !== 200) // OK
        throw new Error(respons.status);
    return await respons.json();
}

async function main() {
    await initialize()

    let theads = Array.from(document.getElementsByClassName('statAttribut'))
    for (let i = 0; i < theads.length; i++) {
        const element = theads[i];
        element.onclick = () => sortTable(i)
    }
    
    fillTable(freqStat())
    console.log(statByDate(Date.now()))
}
main()