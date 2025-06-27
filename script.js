const sheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g";
const tabs = ["SMB","SMS","SMO","SMV"];
let allData = {};
let currentChart = null;

function fetchCourseData() {
  tabs.forEach(tab => {
    fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
      .then(res => res.json())
      .then(rows => {
        allData[tab] = rows;
        if (Object.keys(allData).length === tabs.length) {
          populateCourses();
        }
      })
      .catch(err => console.error("Fetch error:", err));
  });
}

function populateCourses() {
  const sel = document.getElementById("courseSelect");
  sel.innerHTML = '<option value="">--Pilih--</option>';
  tabs.forEach(tab => sel.append(new Option(tab, tab)));
}

function populateStudents() {
  const course = document.getElementById("courseSelect").value;
  const sel = document.getElementById("studentSelect");
  sel.innerHTML = '<option value="">--Pilih--</option>';
  if (course && allData[course]) {
    allData[course].forEach(r => {
      sel.append(new Option(r["NAMA"], r["NAMA"]));
    });
  }
}

function showStudentInfo() {
  const course = document.getElementById("courseSelect").value;
  const student = document.getElementById("studentSelect").value;
  if (!course || !student) return;
  
  const rec = allData[course].find(r => r["NAMA"] === student);
  if (!rec) return;

  document.getElementById("infoCode").textContent = rec["KOD KELAS"];
  document.getElementById("infoName").textContent = rec["NAMA"];
  document.getElementById("infoIC").textContent = rec["IC"];
  document.getElementById("infoQuiz").textContent = rec["KUIZ 1"] || '-';
  document.getElementById("infoQuiz2").textContent = rec["KUIZ 2"] || '-';
  document.getElementById("infoTugasan").textContent = rec["TUGASAN"] || '-';
  document.getElementById("infoUjian1").textContent = rec["UJIAN 1"] || '-';
  document.getElementById("infoUjian2").textContent = rec["UJIAN 2"] || '-';

  document.getElementById("infoCard").classList.remove("hidden");
  const chartEl = document.getElementById("attendanceChart");
  chartEl.classList.remove("hidden");
  
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(chartEl, {
    type: 'doughnut',
    data: {
      labels: ['Hadir', 'Tidak Hadir'],
      datasets: [{
        data: [rec["%KEHADIRAN"], 100 - rec["%KEHADIRAN"]],
        backgroundColor: ['#4caf50','#f44336']
      }]
    },
    options: { responsive: true }
  });

  document.getElementById("download-btn").classList.remove("hidden");
}

function resetAll() {
  document.getElementById("courseSelect").value = "";
  document.getElementById("studentSelect").innerHTML = '<option value="">--Pilih--</option>';
  document.getElementById("infoCard").classList.add("hidden");
  document.getElementById("attendanceChart").classList.add("hidden");
  document.getElementById("download-btn").classList.add("hidden");
  if (currentChart) { currentChart.destroy(); currentChart = null; }
}

document.getElementById("courseSelect").addEventListener("change", populateStudents);
document.getElementById("filter-btn").addEventListener("click", showStudentInfo);
document.getElementById("reset-btn").addEventListener("click", resetAll);

document.getElementById("download-btn").addEventListener("click", () => {
  const el = document.querySelector(".main-card");
  html2canvas(el).then(canvas => {
    import("jspdf").then(jsPDF => {
      const doc = new jsPDF.jsPDF();
      doc.addImage(canvas.toDataURL("image/png"), 'PNG', 10, 10, 180, 0);
      doc.save("pelajar.pdf");
    });
  });
});

fetchCourseData();
