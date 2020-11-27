var statistikTable = document.getElementById('salgcontent')
var orders = []

function fillTable(statMap, sortBy) {
    var map = new Map([...statMap.entries()].sort((a, b) => (a[1][sortBy] > b[1][sortBy]) ? 1 : -1));
    console.log(map)
    for (const e of map) {
        console.log(e[1][sortBy])
        let row = statistikTable.insertRow();

        row.insertCell().innerHTML = e[1].product
        row.insertCell().innerHTML = e[1].amount
        row.insertCell().innerHTML = e[1].sum
    }
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
    return freqMap;
}

async function initialize() {
    try {
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

async function main() {
    await initialize()
    // freqStat()
    fillTable(freqStat(), 'amount')
}
main()