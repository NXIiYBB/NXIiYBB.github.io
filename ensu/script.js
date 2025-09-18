const form = document.getElementById('searchForm');
const input = document.getElementById('studentSuffix');
const msg = document.getElementById('message');
const results = document.getElementById('results');
const attendedList = document.getElementById('attendedList');
const missedList = document.getElementById('missedList');
const noInfo = document.getElementById('noInfo')
const attCount = document.getElementById('attCount');
const missCount = document.getElementById('missCount');

function normalize(v){return v.trim();}

function showMessage(text, isError=true){
    msg.textContent = text;
    msg.style.color = isError ? '#7b0f0f' : '#0a7b29';
}

function clearMessage(){ msg.textContent=''; }

function validateSuffix(s){
    return /^\d{3}-\d$/.test(s);
}

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQITqe0qd_SvBwdwlXNgoKImSse3WAVpeaNahGh9rnZAEMeLdvFSYtj89bF03rwSZpx9yQj-XQ5GS3/pub?output=csv";

function parseCSV(csvText) {
  return csvText.trim().split("\n").map(row => row.split(","));
}

async function loadAttendanceData() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = parseCSV(text);

  const activityHeaders = rows[0]
  .map((a, idx) => ({ a: a.trim(), idx }))   
  .filter(obj => (obj.idx >= 4 && obj.idx <= 11) || (obj.idx >= 14 && obj.idx <= 19))
  .map(obj => obj.a);

  const attendanceMap = {};
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const suffix = row[1].trim(); // รหัส 4 ตัวท้าย
    attendanceMap[suffix] = [];
    for (let j = 4; j < row.length; j++) {
      if (row[j].trim() === "1") { // เข้าร่วม
        attendanceMap[suffix].push(activityHeaders[j - 4]);
      }
    }
  }

  return { activityHeaders, attendanceMap };
}

function renderResults(suffix, activities, attendanceMap){
    const attendedIds = attendanceMap[suffix] || [];
    const attendedSet = new Set(attendedIds);

    attendedList.innerHTML = '';
    missedList.innerHTML = '';

    const attendedActivities = activities.filter(a => attendedSet.has(a));
    const missedActivities = activities.filter(a => !attendedSet.has(a));

    if(attendedActivities.length===0){
    attendedList.innerHTML = '<li class="empty">ไม่มีรายการที่เข้าร่วม</li>';
    } else {
    attendedActivities.forEach(a => {
        const li = document.createElement('li'); li.className='activity';
        li.innerHTML = `✅<strong>${a}</strong>`;
        attendedList.appendChild(li);
    })
    }

    if(!(suffix in attendanceMap)){
        noInfo.style.display = 'grid';
        results.style.display = 'none';
        return;
    } else {
        if(missedActivities.length===0){
        missedList.innerHTML = '<li class="empty">ไม่มีรายการค้าง</li>';
        } else {
        missedActivities.forEach(a => {
            const li = document.createElement('li'); li.className='activity';
            li.innerHTML = `❌<strong>${a}</strong>`;
            missedList.appendChild(li);
        })
        }

        attCount.textContent = attendedActivities.length;
        missCount.textContent = missedActivities.length;
        results.style.display = 'grid';
        noInfo.style.display = 'none';
    }
}

document.getElementById('btnSearch').addEventListener('click', ()=>{
    clearMessage();
    const v = normalize(input.value);
    if(!validateSuffix(v)){
    showMessage('รูปแบบไม่ถูกต้อง — ต้องเป็น xxx-x เช่น 123-4');
    results.style.display='none';
    return;
    }
    const loadingMessage = document.getElementById('loadingSpinner');
    loadingMessage.style.display = 'flex';
    loadAttendanceData().then(({activityHeaders, attendanceMap}) => {
        renderResults(v, activityHeaders, attendanceMap);
        loadingMessage.style.display = 'none';
    });
    showMessage('แสดงผลสำหรับรหัส: ' + v, false);
});

input.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); document.getElementById('btnSearch').click(); }});

input.addEventListener('input', ()=>{
    const raw = input.value.replace(/[^0-9]/g,'');
    if(raw.length<=3){ input.value = raw; }
    else { input.value = raw.slice(0,3) + '-' + raw.slice(3,4); }
});