let allData = {}, currentChart = null;

function fetchCourseData() {
  const sheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g";
  const tabs = ["SMB","SMS","SMO","SMV"];

  tabs.forEach(tab => {
    fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
      .then(r => r.json())
      .then(rows => {
        console.log("Data loaded", tab, rows.length);
        allData[tab] = rows;
        if (Object.keys(allData).length === tabs.length) populateCourses();
      }).catch(console.error);
  });
}

function populateCourses() {
  const sel = document.getElementById("courseSelect");
  sel.innerHTML = `<option value="">--Pilih Kursus--</option>`;
  Object.keys(allData).forEach(tab => {
    sel.add(new Option(tab, tab));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchCourseData();

  document.getElementById("courseSelect").addEventListener("change", () => {
    const sel = document.getElementById("studentSelect");
    sel.innerHTML = `<option value="">--Pilih Pelajar--</option>`;
    const c = document.getElementById("courseSelect").value;
    (allData[c] || []).forEach(r => {
      sel.add(new Option(r["NAMA"], r["NAMA"]));
    });
  });

  document.getElementById("filter-btn").addEventListener("click", () => {
    console.log("Klik Muatkan Pelajar");
    showStudentInfo();
  });

  document.getElementById("reset-btn").addEventListener("click", resetAll);
});

function showStudentInfo() {
  const c = document.getElementById("courseSelect").value;
  const s = document.getElementById("studentSelect").value;
  console.log("showStudentInfo", c, s);
  if (!c || !s) return;

  const rec = allData[c].find(r => r["NAMA"] === s);
  if (!rec) { console.warn("Rekod tidak dijumpai"); return; }

  ["KOD KELAS","NAMA","IC","KUIZ 1","KUIZ 2","TUGASAN","UJIAN 1","UJIAN 2"].forEach((field, i) => {
    const ids = ["Code","Name","IC","Quiz","Quiz2","Tugasan","Ujian1","Ujian2"];
    document.getElementById("info" + ids[i]).textContent = rec[field] || '-';
  });

  document.getElementById("infoCard").classList.remove("hidden");
  const ctx = document.getElementById("attendanceChart").getContext('2d');
  document.querySelector('.chart-container').classList.remove('hidden');

  if (currentChart) currentChart.destroy();
  currentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Hadir','Tidak Hadir'],
      datasets:[{
        data: [+rec["%KEHADIRAN"], 100 - +rec["%KEHADIRAN"]],
        backgroundColor:['#4caf50','#f44336']
      }]
    },
    options:{responsive:true, maintainAspectRatio:false}
  });

  document.getElementById("download-btn").classList.remove("hidden");
}
