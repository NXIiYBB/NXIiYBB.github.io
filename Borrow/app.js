let selectedID = null;

function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("th-TH") + " " +
        d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

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

function render() {

    const grid = document.getElementById("grid");
    grid.innerHTML = "";

    const keyword = document.getElementById("search").value.toLowerCase();
    const filter = document.getElementById("filter").value;

    data.items.forEach(item => {

        const name = item[0];
        const status = item[1];
        const borrower = item[2];
        const dept = item[3];

        if (!name.toLowerCase().includes(keyword)) return;

        if (filter === "free" && status === "borrowed") return;
        if (filter === "busy" && status === "free") return;

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
  <div class="item">${name}</div>
  <div class="${status === "free" ? "free" : "busy"}">
  ${status === "free"
                ? "ว่าง"
                : `ยืมโดย ${borrower} (${dept})`
            }
  </div>
  ${status === "free"
                ? `<button class="borrow" onclick="borrow('${name}')">ยืม</button>`
                : `<button class="return" onclick="returnItem('${name}')">คืน</button>`
            }
  `;

        grid.appendChild(card);
    });
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

function openLogs() {

    const box = document.getElementById("logsList");
    box.innerHTML = "";

    data.logs.reverse().forEach(log => {
        const div = document.createElement("div");
        div.style.padding = "6px 0";
        div.style.borderBottom = "1px solid #eee";

        div.innerHTML = `
  <b>${log.name}</b> — ${log.action}
  <br>
  <small>${log.person} (${log.dept}) • ${formatTime(log.time)}</small>
  `;

        box.appendChild(div);
    });

    document.getElementById("logsModal").style.display = "flex";
}

function closeLogs() {
    document.getElementById("logsModal").style.display = "none";
}

setTimeout(load, 200);
document.getElementById("search").addEventListener("input", render);