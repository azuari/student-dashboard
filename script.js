// Tentukan ID dan nama sheet anda
const sheetID = '1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g';
const sheets = {
  "SMB": [
    {code:"SMB101", name:"Ali Ahmad", ic:"900101-01-1234", quiz1:80, quiz2:75, task:85, exam:78, attendance:88},
    {code:"SMB102", name:"Siti Aminah", ic:"910202-02-2345", quiz1:90, quiz2:93, task:88, exam:91, attendance:95},
  ],
  "SMS": [
    {code:"SMS301", name:"Ahmad Faiz", ic:"920303-03-3456", quiz1:70, quiz2:65, task:72, exam:68, attendance:75},
  ],
  "SMO": [],
  "SMV": []
};

document.addEventListener("DOMContentLoaded", () => {
  const cs = document.getElementById("courseSelect"),
        ss = document.getElementById("studentSelect"),
        loadBtn = document.getElementById("loadBtn"),
        clearBtn = document.getElementById("clearBtn"),
        infoCard = document.getElementById("infoCard"),
        attendanceChart = document.getElementById("attendanceChart"),
        downloadBtn = document.getElementById("downloadBtn");

  Object.keys(sheets).forEach(k => {
    const o = document.createElement("option");
    o.value = k; o.textContent = k;
    cs.appendChild(o);
  });

  cs.addEventListener("change", () => {
    ss.innerHTML = '<option value="">-- Pilih Pelajar --</option>';
    infoCard.classList.add("hidden");
    attendanceChart.classList.add("hidden");
    downloadBtn.classList.add("hidden");

    const arr = sheets[cs.value] || [];
    arr.forEach(p => {
      const o = document.createElement("option");
      o.value = p.code;
      o.textContent = p.name;
      o.style.fontSize = "10px";
      ss.appendChild(o);
    });
  });

  loadBtn.addEventListener("click", () => {
    const kursus = cs.value, name = ss.value;
    if (!kursus || !name) return alert("Sila pilih kursus & pelajar.");
    const pelajar = sheets[kursus].find(p => p.name === name);
    if (!pelajar) return;

    document.getElementById("infoCode").textContent = pelajar.code;
    document.getElementById("infoName").textContent = pelajar.name;
    document.getElementById("infoIC").textContent = pelajar.ic;
    document.getElementById("infoQuiz1").textContent = pelajar.quiz1;
    document.getElementById("infoQuiz2").textContent = pelajar.quiz2;
    document.getElementById("infoTask").textContent = pelajar.task;
    document.getElementById("infoExam").textContent = pelajar.exam;
    infoCard.classList.remove("hidden");

    renderChart(attendanceChart, pelajar.attendance);
    attendanceChart.classList.remove("hidden");
    downloadBtn.classList.remove("hidden");
  });

  clearBtn.addEventListener("click", () => {
    cs.value = "";
    ss.innerHTML = '<option value="">-- Pilih Pelajar --</option>';
    infoCard.classList.add("hidden");
    attendanceChart.classList.add("hidden");
    downloadBtn.classList.add("hidden");
  });

  downloadBtn.addEventListener("click", () => {
    html2canvas(document.querySelector(".container")).then(canvas => {
      const img = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(img, "PNG", 0, 0);
      pdf.save("pelajar.pdf");
    });
  });
});

function renderChart(canvas, att) {
  const ctx = canvas.getContext("2d");
  if (window.chart) window.chart.destroy();
  window.chart = new Chart(ctx, {
    type: "doughnut",
    data: { labels:["Hadir","Tidak"], datasets:[{ data:[att,100-att], backgroundColor:["#4CAF50","#eee"] }] },
    options: { responsive: true, plugins:{ legend:{position:"bottom"} } }
  });
}
