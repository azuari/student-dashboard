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
  const query = document.getElementById('filter-class').value.trim().toLowerCase();
  if (!query) return alert('Sila masukkan Kod Kelas atau Nama.');

  const url = 'https://opensheet.elk.sh/YOUR_SHEET_ID/SMB';
  try {
    const resp = await fetch(url);
    const rows = await resp.json();

    const students = rows.filter(r =>
      r['KOD KELAS']?.toLowerCase().includes(query) ||
      r['NAMA']?.toLowerCase().includes(query)
    );

    showCards(students);
    drawChart(students);
  } catch (e) {
    alert('Gagal memuat data: ' + e);
  }
}

function showCards(students) {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  if (!students.length) {
    container.innerHTML = '<p>Tiada rekod ditemui.</p>';
    return;
  }

  students.forEach(st => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${st['KOD KELAS']} - ${st['NAMA']}</h3>
      <p><strong>IC:</strong> ${st['IC']}</p>
    `;
    container.appendChild(div);
  });
}

function drawChart(students) {
  const ctx = document.getElementById('attendanceChart').getContext('2d');
  if (chart) chart.destroy();

  const present = students.reduce((sum, s) => sum + (+s['%KEHADIRAN'] || 0), 0);
  const avg = students.length ? (present / students.length).toFixed(1) : 0;

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [`Purata Kehadiran (${avg}%)`, 'Baki (%)'],
      datasets: [{
        data: [avg, 100 - avg],
        backgroundColor: ['#4CAF50', '#e0e0e0']
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        tooltip: { callbacks: { label: ctx => ctx.label } },
        legend: { display: false },
        title: { display: true, text: 'Purata Kehadiran (%)' }
      }
    }
  });
}

async function downloadPDF() {
  const container = document.querySelector('.container');
  const canvas = await html2canvas(container, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save('dashboard_pelajar.pdf');
}
