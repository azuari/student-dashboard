const sheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g";
const tabs = ["SMB","SMS","SMO","SMV"];
let allData = {};
let currentChart = null;

const fieldMapping = {
  Code: "KOD KELAS",
  Name: "NAMA",
  IC: "IC",
  Quiz: "KUIZ 1",
  Quiz2: "KUIZ 2",
  Tugasan: "TUGASAN",
  Ujian1: "UJIAN 1",
  Ujian2: "UJIAN 2"
};

function fetchCourseData() {
  tabs.forEach(tab => {
    fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
      .then(r => r.json())
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
  sel.innerHTML = `<option value="">--Pilih--</option>`;
  tabs.forEach(tab => sel.append(new Option(tab, tab)));
}

function populateStudents() {
  const course = document.getElementById("courseSelect").value;
  const sel = document.getElementById("studentSelect");
  sel.innerHTML = "<option value=''>--Pilih--</option>";
  if (course && allData[course]) {
    allData[course].forEach(r => sel.append(new Option(r["NAMA"], r["NAMA"])));
  }
}

function showStudentInfo() {
  const course = document.getElementById("courseSelect").value;
  const student = document.getElementById("studentSelect").value;
  if (!course || !student) return;

  const rec = allData[course].find(r => r["NAMA"] === student);
  console.log("Rec:", rec);
  const chartEl = document.getElementById("attendanceChart");
  console.log("Canvas found?", chartEl);

  if (!rec || !chartEl) return;

  Object.entries(fieldMapping).forEach(([key, fld]) => {
    document.getElementById("info"+key).textContent = rec[fld] || '-';
  });

  document.getElementById("infoCard").classList.remove("hidden");
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
  document.getElementById("studentSelect").innerHTML = "<option value=''>--Pilih--</option>";
  document.getElementById("infoCard").classList.add("hidden");
  document.getElementById("attendanceChart").classList.add("hidden");
  document.getElementById("download-btn").classList.add("hidden");
  if (currentChart) { currentChart.destroy(); currentChart = null; }
}

document.getElementById("courseSelect").addEventListener("change", populateStudents);
document.getElementById("filter-btn").addEventListener("click", showStudentInfo);
document.getElementById("reset-btn").addEventListener("click", resetAll);

document.getElementById("download-btn").addEventListener("click", () => {
  html2canvas(document.querySelector(".main-card")).then(canvas => {
    import("jspdf").then(jsPDF => {
      const doc = new jsPDF.jsPDF();
      doc.addImage(canvas.toDataURL("image/png"), 'PNG', 10, 10, 180, 0);
      doc.save("pelajar.pdf");
    });
  });
});

fetchCourseData();
