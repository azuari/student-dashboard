// Tentukan ID dan nama sheet anda
const sheetID = '1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g';
const sheetName = 'SMB';

// URL API opensheet.elk.sh
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

// Dapatkan elemen container
const container = document.querySelector('.container');
if (!container) {
  alert('Elemen .container tidak dijumpai. Pastikan index.html ada <div class="container">');
  throw new Error('Container missing');
}

// Ambil data daripada Sheet
fetch(url)
  .then(res => res.json())
  .then(data => initDashboard(data))
  .catch(err => alert('Gagal memuat data: ' + err));

// Inisialisasi paparan dashboard
function initDashboard(data) {
  container.innerHTML = `
    <h2>Dashboard Maklumat Pelajar</h2>
    <div id="filterBar">
      <input type="text" id="filterClass" placeholder="Masukkan Kod Kelas">
      <input type="text" id="filterName" placeholder="Masukkan Nama">
      <button id="searchBtn">Cari</button>
    </div>
    <table id="studentTable">
      <thead><tr><th>KOD KELAS</th><th>NAMA</th></tr></thead>
      <tbody></tbody>
    </table>
    <div id="resultCard" class="card-container"></div>
    <button id="downloadPdf">Muat Turun PDF</button>
  `;

  const tbody = document.querySelector('#studentTable tbody');
  data.forEach(r => {
    tbody.innerHTML += `
      <tr data-class="${r['KOD KELAS']}" data-name="${r['NAMA'].toLowerCase()}">
        <td>${r['KOD KELAS']}</td><td>${r['NAMA']}</td>
      </tr>`;
  });

document.getElementById('filter-btn').addEventListener('click', loadData);
document.getElementById('download-btn').addEventListener('click', downloadPDF);

let chart;

async function loadData() {
  const course = document.getElementById('filter-course').value;
  const query = document.getElementById('filter-input').value.trim().toLowerCase();

  if (!course) return alert('Sila pilih kursus.');
  if (!query) return alert('Masukkan kod kelas atau nama pelajar.');

  const sheetID = 'YOUR_SHEET_ID';
  const url = `https://opensheet.elk.sh/${sheetID}/${course}`;

  try {
    const resp = await fetch(url);
    const rows = await resp.json();

    const filtered = rows.filter(r =>
      r['KOD KELAS']?.toLowerCase().includes(query) ||
      r['NAMA']?.toLowerCase().includes(query)
    );

    showCards(filtered);
    drawChart(filtered);
  } catch (e) {
    alert('Gagal memuat data: ' + e);
  }
}

function showCards(students) {
  const cont = document.getElementById('cards-container');
  cont.innerHTML = '';
  if (!students.length) {
    cont.innerHTML = '<p>Tiada rekod ditemui.</p>';
    return;
  }
  students.forEach(s => {
    const c = document.createElement('div');
    c.className = 'card';
    c.innerHTML = `
      <h3>${s['KOD KELAS']} - ${s['NAMA']}</h3>
      <p><strong>IC:</strong> ${s['IC']}</p>
      <p><strong>Kehadiran:</strong> ${s['%KEHADIRAN'] || '0'}%</p>
      <p><strong>Kuiz1:</strong> ${s['KUIZ 1']}, <strong>Kuiz2:</strong> ${s['KUIZ 2']}</p>
      <p><strong>Ujian1:</strong> ${s['UJIAN 1']}, <strong>Ujian2:</strong> ${s['UJIAN 2']}</p>
    `;
    cont.appendChild(c);
  });
}

function drawChart(students) {
  const ctx = document.getElementById('attendanceChart').getContext('2d');
  chart?.destroy();

  const sumPerc = students.reduce((a, s) => a + (+s['%KEHADIRAN'] || 0), 0);
  const avg = students.length ? (sumPerc / students.length).toFixed(1) : 0;

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [`Purata Kehadiran (${avg}%)`, ''],
      datasets: [{
        data: [avg, 100 - avg],
        backgroundColor: ['#4CAF50', '#e0e0e0']
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Purata Kehadiran' }
      }
    }
  });
}

async function downloadPDF() {
  const cont = document.querySelector('.container');
  const canv = await html2canvas(cont, { scale: 2 });
  const img = canv.toDataURL('image/png');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const props = pdf.getImageProperties(img);
  const w = pdf.internal.pageSize.getWidth();
  const h = (props.height * w) / props.width;

  pdf.addImage(img, 'PNG', 0, 0, w, h);
  pdf.save('dashboard-pelajar.pdf');
}
