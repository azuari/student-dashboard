const sheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g";
const tabs = ["SMB","SMS","SMO","SMV"];
let allData = {};
let currentChart = null;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("courseSelect").addEventListener("change", populateStudents);
  document.getElementById("filter-btn").addEventListener("click", showStudentInfo);
  document.getElementById("reset-btn").addEventListener("click", resetAll);

  document.getElementById("download-btn").addEventListener("click", () => {
    html2canvas(document.querySelector(".main-card"), { scale: 2 }).then(canvas => {
      import("jspdf").then(jsPDF => {
        const doc = new jsPDF.jsPDF({ unit: 'pt', format: 'a4' });
        const img = canvas.toDataURL("image/png");
        const pageWidth = doc.internal.pageSize.getWidth();
        const imgProps = doc.getImageProperties(img);
        const pdfHeight = (imgProps.height * pageWidth) / imgProps.width;
        doc.addImage(img, 'PNG', 0, 0, pageWidth, pdfHeight);
        doc.save("pelajar.pdf");
      });
    });
  });

  fetchCourseData();
});

function fetchCourseData() {
  tabs.forEach(tab => {
    fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
      .then(r => r.json())
      .then(rows => {
        allData[tab] = rows;
        if (Object.keys(allData).length === tabs.length) populateCourses();
      }).catch(err => console.error("Fetch error:", err));
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
  sel.innerHTML = "<option value=''>--Pilih--</option>";
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

  document.getElementById("infoCode").textContent = rec["KOD KELAS"];
  document.getElementById("infoName").textContent = rec["NAMA"];
  document.getElementById("infoIC").textContent = rec["IC"];
  document.getElementById("infoQuiz").textContent = rec["KUIZ 1"] || '-';
  document.getElementById("infoQuiz2").textContent = rec["KUIZ 2"] || '-';
  document.getElementById("infoTugasan").textContent = rec["TUGASAN"] || '-';
  document.getElementById("infoUjian1").textContent = rec["UJIAN 1"] || '-';
  document.getElementById("infoUjian2").textContent = rec["UJIAN 2"] || '-';

  document.getElementById("infoCard").classList.remove("hidden");

  const ctx = document.getElementById("attendanceChart").getContext('2d');
  document.querySelector('.chart-container').classList.remove('hidden');
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Hadir', 'Tidak Hadir'],
      datasets: [{
        data: [Number(rec["%KEHADIRAN"]) || 0, 100 - (Number(rec["%KEHADIRAN"]) || 0)],
        backgroundColor: ['#4caf50','#f44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });

  document.getElementById("attendanceChart").style.display = 'block';
  document.getElementById("download-btn").classList.remove("hidden");
}

function resetAll() {
  document.getElementById("courseSelect").value = "";
  document.getElementById("studentSelect").innerHTML = "<option value=''>--Pilih--</option>";
  document.getElementById("infoCard").classList.add("hidden");
  document.querySelector('.chart-container').classList.add("hidden");
  document.getElementById("download-btn").classList.add("hidden");
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}
