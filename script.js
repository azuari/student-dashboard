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
      })
      .catch(err => console.error("Fetch error:", err));
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
    options: {responsive:true, maintainAspectRatio:false}
  });

  document.getElementById("download-btn").classList.remove("hidden");
}

function resetAll() {
  document.getElementById("courseSelect").value = "";
  document.getElementById("studentSelect").innerHTML = "<option value=''>--Pilih--</option>";
  document.getElementById("infoCard").classList.add("hidden");
  document.getElementById("attendanceChart").classList.add("hidden");
  document.getElementById("download-btn").classList.add("hidden");
  if (currentChart) currentChart.destroy();
}

function setupPdfDownload() {
  window.html2canvas = window.html2canvas; // diperlukan

 document.getElementById("download-btn").addEventListener("click", () => {
  const el = document.querySelector(".main-card");
  html2canvas(el, { scale: 2, useCORS: true, scrollY: -window.scrollY })
    .then(canvas => {
      const imgData = canvas.toDataURL("image/png", 1.0);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", hotfixes: ['px_scaling'] });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidthMm = pageWidth - 20; // margin 10mm kiri + kanan
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      const posX = (pageWidth - imgWidthMm) / 2;
      const posY = (pageHeight - imgHeightMm) / 2;
      pdf.addImage(imgData, "PNG", posX, posY, imgWidthMm, imgHeightMm);
      pdf.save("pelajar.pdf");
    })
    .catch(err => console.error(err));
});

}

// Event assignments
document.getElementById("courseSelect").addEventListener("change", populateStudents);
document.getElementById("filter-btn").addEventListener("click", showStudentInfo);
document.getElementById("reset-btn").addEventListener("click", resetAll);

fetchCourseData();
setupPdfDownload();
