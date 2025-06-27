const spreadsheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g";
const courses = ["SMB","SMS","SMO","SMV"];

const courseSelect = document.getElementById("courseSelect");
const studentSelect = document.getElementById("studentSelect");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
const card = document.getElementById("card");
const infoCode = document.getElementById("infoCode");
const infoName = document.getElementById("infoName");
const infoIC = document.getElementById("infoIC");
const attendanceChart = document.getElementById("attendanceChart");
const downloadBtn = document.getElementById("downloadBtn");

let currentData = [];

courses.forEach(c => {
  let opt = document.createElement("option");
  opt.value = c; opt.textContent = c;
  courseSelect.appendChild(opt);
});

courseSelect.addEventListener("change", () => {
  const c = courseSelect.value;
  studentSelect.innerHTML = '<option value="">Pilih Pelajar...</option>';
  studentSelect.disabled = true;
  loadBtn.disabled = true;
  card.classList.add("hidden");
  downloadBtn.classList.add("hidden");

  if (!c) return;

  fetch(`https://opensheet.elk.sh/${spreadsheetId}/${c}`)
    .then(r => r.json())
    .then(data => {
      currentData = data;
      data.forEach(row => {
        let o = document.createElement("option");
        o.value = row["KOD KELAS"] + "|" + row["NAMA"] + "|" + row["IC"];
        o.textContent = row["NAMA"];
        studentSelect.appendChild(o);
      });
      studentSelect.disabled = false;
    })
    .catch(e => alert("Gagal muat pelajar: " + e));
});

studentSelect.addEventListener("change", () => {
  loadBtn.disabled = !studentSelect.value;
});

loadBtn.addEventListener("click", () => {
  const parts = studentSelect.value.split("|");
  infoCode.textContent = parts[0];
  infoName.textContent = parts[1];
  infoIC.textContent = parts[2];
  card.classList.remove("hidden");

  const row = currentData.find(r => r["NAMA"] === parts[1]);
  if (row && row["%KEHADIRAN"]) {
    const ctx = attendanceChart.getContext("2d");
    new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['Hadir','Tidak'], datasets: [{
        data: [+row["%KEHADIRAN"],100 - (+row["%KEHADIRAN"])],
        backgroundColor: ['#4caf50','#f44336']
      }]},
      options: { responsive: true, maintainAspectRatio: false }
    });
    attendanceChart.parentElement.style.height = '150px';
    attendanceChart.classList.remove("hidden");
  }
  downloadBtn.classList.remove("hidden");
});

resetBtn.addEventListener("click", () => {
  courseSelect.value = "";
  studentSelect.innerHTML = '<option value="">Pilih Pelajar...</option>';
  studentSelect.disabled = true;
  loadBtn.disabled = true;
  card.classList.add("hidden");
  attendanceChart.classList.add("hidden");
  downloadBtn.classList.add("hidden");
});
