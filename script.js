const sheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g";
const tabs = ["SMB","SMS","SMO","SMV"];
let allData = {};
let currentChart = null;

function fetchCourseData() {
  tabs.forEach(tab => {
    fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
      .then(r => r.json())
      .then(rows => {
        allData[tab] = rows;
        if (Object.keys(allData).length === tabs.length) {
          populateCourses();
        }
      }).catch(console.error);
  });
}

function populateCourses() {
  const sel = document.getElementById("courseSelect");
  tabs.forEach(tab => {
    const opt = document.createElement("option");
    opt.value = tab;
    opt.textContent = tab;
    sel.append(opt);
  });
}

function populateStudents() {
  const course = document.getElementById("courseSelect").value;
  const sel = document.getElementById("studentSelect");
  sel.innerHTML = `<option value="">--Pilih--</option>`;
  if (course && allData[course]) {
    allData[course].forEach(r => {
      const o = document.createElement("option");
      o.value = r["NAMA"];
      o.textContent = r["NAMA"];
      sel.append(o);
    });
  }
}

function showStudentInfo() {
  const course = document.getElementById("courseSelect").value;
  const student = document.getElementById("studentSelect").value;
  if (!course || !student) return;

  const rec = allData[course].find(r => r["NAMA"] === student);
  if (!rec) return;

  ["Code","Name","IC","Quiz","Quiz2","Tugasan","Ujian1","Ujian2"].forEach(k => {
    document.getElementById("info" + k).textContent = rec[k === "Code" ? "KOD KELAS" : 
      k === "Name" ? "NAMA" :
      k === "IC" ? "IC" :
      k === "Quiz" ? "KUIZ 1" :
      k === "Quiz2" ? "KUIZ 2" :
      k === "Tugasan" ? "TUGASAN" :
      k === "Ujian1" ? "UJIAN 1" : "UJIAN 2"] || '-';
  });

  document.getElementById("infoCard").classList.remove("hidden");

  const chartEl = document.getElementById("attendanceChart");
  const ctx = chartEl.getContext('2d');
  chartEl.classList.remove("hidden");
  if (window.currentChart) window.currentChart.destroy();
  window.currentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {...},
    options: { responsive: true, maintainAspectRatio: false }
  });
  document.getElementById("download-btn").classList.remove("hidden");
}

function resetAll() {
  document.getElementById("courseSelect").value = "";
  document.getElementById("studentSelect").innerHTML = `<option value="">--Pilih--</option>`;
  document.getElementById("infoCard").classList.add("hidden");
  document.getElementById("attendanceChart").classList.add("hidden");
  document.getElementById("download-btn").classList.add("hidden");
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}

document.getElementById("courseSelect").addEventListener("change", populateStudents);
document.getElementById("filter-btn").addEventListener("click", showStudentInfo);
document.getElementById("reset-btn").addEventListener("click", resetAll);

document.getElementById("download-btn").addEventListener("click", () => {
  const canvas = document.getElementById("attendanceChart");
  const img = canvas.toDataURL('image/png', 1.0);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'p', unit:'mm', format:'a4' });
  const width = doc.internal.pageSize.getWidth() - 20;
  doc.addImage(img, 'PNG', 10, 100, width, width * canvas.height / canvas.width);
  doc.save("pelajar.pdf");
});

fetchCourseData();
