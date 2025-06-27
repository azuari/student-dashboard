// Tentukan ID dan nama sheet anda
const sheetID = '1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g';
const sheetId = 'SPREADSHEET_ID'; // Ganti dengan ID anda
const sheets = ['SMB','SMS','SMO','SMV'];
const courseSelect = document.getElementById('courseSelect');
const studentSelect = document.getElementById('studentSelect');
const loadBtn = document.getElementById('loadBtn');
const resetBtn = document.getElementById('resetBtn');
const cardsContainer = document.getElementById('cardsContainer');
const chartCanvas = document.getElementById('attendanceChart');
const downloadBtn = document.getElementById('downloadBtn');
let attendanceChart;

courseSelect.addEventListener('change', () => {
  const c = courseSelect.value;
  if (c) fetchSheet(c).then(data => {
    populateStudents(data);
    studentSelect.disabled = false;
    loadBtn.disabled = false;
  });
  else clearAll();
});
loadBtn.addEventListener('click', () => {
  const c = courseSelect.value;
  const sel = studentSelect.value;
  if (!sel) return alert('Pilih pelajar');
  fetchSheet(c).then(data => {
    const s = data.find(r => r.NAMA === sel);
    if (!s) return alert('Pelajar tiada');
    showInfo(s); drawChart(s);
    downloadBtn.hidden = false;
  });
});
resetBtn.addEventListener('click', clearAll);

downloadBtn.addEventListener('click', () => {
  html2canvas(document.querySelector('.container')).then(canvas => {
    const img = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF();
    pdf.addImage(img, 'PNG', 0, 0, 210, 0);
    pdf.save('profil_pelajar.pdf');
  });
});

function fetchSheet(name) {
  return fetch(`https://opensheet.elk.sh/${sheetId}/${name}`)
    .then(r => r.json());
}

function populateStudents(data) {
  studentSelect.innerHTML = '<option value="">Pilih Pelajar</option>';
  data.forEach(r => {
    const o = document.createElement('option');
    o.value = r.NAMA; o.textContent = r.NAMA;
    studentSelect.appendChild(o);
  });
}

function clearAll() {
  studentSelect.innerHTML = '<option value="">Pilih Pelajar</option>';
  studentSelect.disabled = true;
  loadBtn.disabled = true;
  cardsContainer.innerHTML = '';
  chartCanvas.style.display = 'none';
  downloadBtn.hidden = true;
  if (attendanceChart) attendanceChart.destroy();
}

function showInfo(s) {
  cardsContainer.innerHTML = `
    <div class="card">
      <p><b>KOD KELAS:</b> ${s['KOD KELAS']}</p>
      <p><b>NAMA:</b> ${s.NAMA}</p>
      <p><b>IC:</b> ${s.IC}</p>
    </div>`;
}

function drawChart(s) {
  chartCanvas.style.display = 'block';
  const val = parseFloat(s['%KEHADIRAN']) || 0;
  const data = { labels: ['Kehadiran','Tiada'], datasets: [{ data: [val,100-val], backgroundColor: ['#4caf50','#ddd'] }]};
  if (attendanceChart) attendanceChart.destroy();
  attendanceChart = new Chart(chartCanvas, { type: 'doughnut', data });
}
