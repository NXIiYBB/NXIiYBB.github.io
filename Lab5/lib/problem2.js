function readInput() {
    const list = [];
    while (true) {
        let input = prompt("Enter an integer (a negative integer to quit):");
        if (input === null) continue;
        let num = Number(input);
        if (!Number.isInteger(num)) continue;
        if (num < 0) break;
        list.push(num);
    }
    return list;
}

function displayStats(list) {
    if (list.length !== 0) {
        const avg = list.length ? (list.reduce((a,b) => a+b,0) / list.length) : 0;
        const min = list.length ? Math.min(...list) : 0;
        const max = list.length ? Math.max(...list) : 0;
        alert(`For the list ${list.join(", ")}, the average is ${avg.toFixed(2)}, the minimum is ${min}, and the maximum is ${max}`);
    } else {
        alert(`For the list that is empty, the average is 0, the minimum is 0, and the maximum is 0`);
    }
}

const list = readInput();
displayStats(list);