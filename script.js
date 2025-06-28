// Pastikan pustaka untuk jsPDF di-load sebelum ini
window.html2canvas = html2canvas;
const { jsPDF } = window.jspdf;

const sheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g";
const tabs = ["SMB","SMS","SMO","SMV"];
let allData = {};
let currentChart = null;

// 1. Muat semua sheet data
tabs.forEach(tab => {
  fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
    .then(r => r.json())
    .then(rows => {
      allData[tab] = rows;
      // Apabila semua tab selesai dimuat
      if (Object.keys(allData).length === tabs.length) {
        populateCourses();
      }
    })
    .catch(err => console.error("Fetch error:", err));
});

// 2. Isi dropdown kursus
function populateCourses() {
  const sel = document.getElementById("courseSelect");
  sel.innerHTML = `<option value="">-- Pilih Kursus --</option>`;
  tabs.forEach(t => {
    const o = document.createElement("option");
    o.value = t;
    o.textContent = t;
    sel.append(o);
  });
}

// 3. Seleksi pelajar berdasarkan kursus
document.getElementById("courseSelect").addEventListener("change", () => {
  const course = document.getElementById("courseSelect").value;
  const sel = document.getElementById("studentSelect");
  sel.innerHTML = `<option value="">-- Pilih Pelajar --</option>`;
  if (allData[course]) {
    allData[course].forEach(r => {
      const o = document.createElement("option");
      o.value = r["NAMA"];
      o.textContent = r["NAMA"];
      sel.append(o);
    });
  }
});

// 4. Paparan maklumat pelajar & graf
document.getElementById("filter-btn").addEventListener("click", () => {
  const course = document.getElementById("courseSelect").value;
  const student = document.getElementById("studentSelect").value;
  if (!course || !student) return;

  const rec = allData[course].find(r => r["NAMA"] === student);
  if (!rec) return;

  document.getElementById("infoCode").textContent = rec["KOD KELAS"] || "-";
  document.getElementById("infoName").textContent = rec["NAMA"] || "-";
  document.getElementById("infoIC").textContent = rec["IC"] || "-";
  document.getElementById("infoQuiz").textContent = rec["KUIZ 1"] || "-";
  document.getElementById("infoQuiz2").textContent = rec["KUIZ 2"] || "-";
  document.getElementById("infoTugasan").textContent = rec["TUGASAN"] || "-";
  document.getElementById("infoUjian1").textContent = rec["Ujian 1"] || "-";
  document.getElementById("infoUjian2").textContent = rec["Ujian 2"] || "-";

  document.getElementById("infoCard").classList.remove("hidden");
  document.querySelector(".chart-container").classList.remove("hidden");
  document.getElementById("download-btn").classList.remove("hidden");

  const ctx = document.getElementById("attendanceChart").getContext("2d");
  if (currentChart) currentChart.destroy();
  currentChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Hadir", "Tidak Hadir"],
      datasets: [{
        data: [rec["%KEHADIRAN"] || 0, 100 - (rec["%KEHADIRAN"] || 0)],
        backgroundColor: ["#4caf50", "#f44336"],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
});

// 5. Muat turun PDF (hasil tangkapan kad utama)
document.getElementById("download-btn").addEventListener("click", () => {
  html2canvas(document.querySelector(".main-card"), { scale: 2 })
    .then(canvas => {
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF('p', 'pt', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, 'PNG', 0, 20, w, h);
      pdf.save("pelajar.pdf");
    });
});

// 6. Reset semula paparan
document.getElementById("reset-btn").addEventListener("click", () => {
  document.getElementById("courseSelect").value = "";
  document.getElementById("studentSelect").innerHTML = "<option value=''>-- Pilih Pelajar --</option>";
  document.getElementById("infoCard").classList.add("hidden");
  document.querySelector(".chart-container").classList.add("hidden");
  document.getElementById("download-btn").classList.add("hidden");
  currentChart?.destroy();
  currentChart = null;
});
