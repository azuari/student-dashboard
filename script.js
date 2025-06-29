window.html2canvas = html2canvas;
const { jsPDF } = window.jspdf;

const sheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g";
const tabs = ["SMB", "SMS", "SMO", "SMV"];
let allData = {}, currentChart = null;

tabs.forEach(tab => {
  fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
    .then(r => r.json())
    .then(rows => {
      allData[tab] = rows;
      console.log(`Data loaded ${tab} ${rows.length}`);
      if (Object.keys(allData).length === tabs.length) {
        const sel = document.getElementById("courseSelect");
        tabs.forEach(t => {
          const o = document.createElement("option");
          o.value = o.textContent = t;
          sel.append(o);
        });
      }
    });
});

document.getElementById("courseSelect").addEventListener("change", () => {
  const sel = document.getElementById("studentSelect");
  sel.innerHTML = `<option value="">-- Pilih --</option>`;
  const course = document.getElementById("courseSelect").value;
  allData[course]?.forEach(r => {
    const o = document.createElement("option");
    o.value = o.textContent = r["NAMA"];
    sel.append(o);
  });
});

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
  document.getElementById("infoUjian1").textContent = rec["UJIAN 1"] || "-";
  document.getElementById("infoUjian2").textContent = rec["UJIAN 2"] || "-";

  document.getElementById("infoCard").classList.remove("hidden");
  document.querySelector(".chart-container").classList.remove("hidden");
  document.getElementById("download-btn").classList.remove("hidden");

  const ctx = document.getElementById("attendanceChart").getContext('2d');
  if (currentChart) currentChart.destroy();
  currentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Hadir', 'Tidak Hadir'],
      datasets: [{
        data: [rec["%KEHADIRAN"] || 0, 100 - (rec["%KEHADIRAN"] || 0)],
        backgroundColor: ['#4caf50', '#f44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom' }
      }
    }
  });
});

document.getElementById("reset-btn").addEventListener("click", () => {
  document.getElementById("courseSelect").value = "";
  document.getElementById("studentSelect").innerHTML = `<option value="">-- Pilih Pelajar --</option>`;
  document.getElementById("infoCard").classList.add("hidden");
  document.querySelector(".chart-container").classList.add("hidden");
  document.getElementById("download-btn").classList.add("hidden");
  if (currentChart) currentChart.destroy();
});

document.getElementById("download-btn").addEventListener("click", () => {
  html2canvas(document.querySelector(".main-card"), { scale: 2 }).then(canvas => {
    const pdf = new jsPDF("p", "pt", "a4");
    const img = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const height = canvas.height * (pageWidth / canvas.width);
    pdf.addImage(img, 'PNG', 0, 0, pageWidth, height);
    pdf.save("pelajar.pdf");
  });
});
