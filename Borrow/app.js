async function load() {
    const res = await fetch(API_URL);
    const data = await res.json();

    const keyword = document.getElementById("search").value.toLowerCase();
    let html = "";
    let borrowed = [];

    for (let i = 1; i < data.items.length; i++) {
        let r = data.items[i];
        if (!r[1].toLowerCase().includes(keyword)) continue;

        if (r[2] == "ถูกยืม") borrowed.push(r);

        html += `
   <div class="card">
   <b>${r[1]}</b><br>
   <span class="${r[2] == "ว่าง" ? "free" : "busy"}">${r[2]}</span><br>
   ${r[2] == "ว่าง"
                ? `<button onclick="borrow(${r[0]})">ยืม</button>`
                : `ผู้ยืม: ${r[3]} (${r[4]})
       <br><button onclick="update(${r[0]} ,'ว่าง','','')">คืน</button>`
            }
   </div>`;
    }

    document.getElementById("list").innerHTML = html;

    document.getElementById("summary").innerHTML =
        `<b>ของที่ยังไม่คืน:</b><br>` +
        borrowed.map(x => `${x[1]} — ${x[3]}`).join("<br>");
}

function addItem() {
    const name = prompt("ชื่ออุปกรณ์");
    if (!name) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "add", item: name })
    }).then(load);
}

function borrow(id) {
    const name = prompt("ชื่อเล่น");
    const dept = prompt("ฝ่าย");
    if (!name || !dept) return;
    update(id, "ถูกยืม", name, dept);
}

function update(id, status, name, dept) {
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "update",
            id: id,
            status: status,
            borrower: name,
            dept: dept
        })
    }).then(load);
}

async function showLogs() {
    const res = await fetch(API_URL);
    const data = await res.json();

    let html = "<b>ประวัติ</b><br><br>";
    for (let i = 1; i < data.logs.length; i++) {
        let r = data.logs[i];
        html += `${r[0]} — ${r[1]} — ${r[2]} — ${r[3]} (${r[4]})<br>`;
    }
    document.getElementById("logs").innerHTML = html;
}

load();