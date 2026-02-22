let selectedID = null;

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
   <div class="item">${r[1]}</div>
   <div class="${r[2] == "ว่าง" ? "free" : "busy"}">${r[2]}</div>

   ${r[2] == "ว่าง"
                ? `<button class="borrow" onclick="openModal(${r[0]})">ยืม</button>`
                : `ผู้ยืม: ${r[3]} (${r[4]})
       <br><button class="return" onclick="update(${r[0]} ,'ว่าง','','')">คืน</button>`
            }
   </div>`;
    }

    document.getElementById("list").innerHTML = html;

    document.getElementById("summary").innerHTML =
        "<b>ของที่ยังไม่คืน:</b><br>" +
        borrowed.map(x => `${x[1]} — ${x[3]}`).join("<br>");
}

function openModal(id) {
    selectedID = id;
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

function confirmBorrow() {
    const name = document.getElementById("borrowName").value;
    const dept = document.getElementById("borrowDept").value;

    if (!name || !dept) return alert("กรอกข้อมูลให้ครบ");

    update(selectedID, "ถูกยืม", name, dept);
    closeModal();
}

function addItem() {
    const name = prompt("ชื่ออุปกรณ์");
    if (!name) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "add", item: name })
    }).then(load);
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

function openAdd() {
    document.getElementById("addModal").style.display = "flex";
}

function closeAdd() {
    document.getElementById("addModal").style.display = "none";
}

function confirmAdd() {
    const name = document.getElementById("newItemName").value;
    if (!name) return alert("กรอกชื่อก่อน");

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "add", item: name })
    }).then(() => {
        closeAdd();
        load();
    });
}

setTimeout(load, 200);