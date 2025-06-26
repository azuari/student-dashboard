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

  document.getElementById('searchBtn').onclick = () => searchStudent(data);
  document.getElementById('downloadPdf').onclick = downloadPdf;
}

// Cari pelajar dan paparkan dalam kad
function searchStudent(data) {
  const kod = document.getElementById('filterClass').value.trim().toLowerCase();
  const nama = document.getElementById('filterName').value.trim().toLowerCase();

  const found = data.find(r => {
    return (!kod || r['KOD KELAS'].toLowerCase() === kod)
      && (!nama || r['NAMA'].toLowerCase().includes(nama));
  });

  const resultCard = document.getElementById('resultCard');
  resultCard.innerHTML = '';  // Kosongkan

  if (!found) {
    resultCard.innerHTML = `<p>Tiada data ditemui.</p>`;
    return;
  }

  resultCard.innerHTML = `
    <div class="card">
      <h3>${found['NAMA']}</h3>
      <p><strong>KOD KELAS:</strong> ${found['KOD KELAS']}</p>
      <p><strong>IC:</strong> ${found['IC']}</p>
      <canvas id="attendanceChart" width="200" height="200"></canvas>
      <p><strong>KUIZ 1:</strong> ${found['KUIZ 1']} | <strong>KUIZ 2:</strong> ${found['KUIZ 2']}</p>
      <p><strong>TUGASAN:</strong> ${found['TUGASAN']} | <strong>UJIAN 1:</strong> ${found['UJIAN 1']} | <strong>UJIAN 2:</strong> ${found['UJIAN 2']}</p>
    </div>`;

  // Lukis graf kehadiran jika Chart.js ada
  const ctx = document.getElementById('attendanceChart')?.getContext('2d');
  if (ctx) {
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Hadir', 'Tidak Hadir'],
        datasets: [{
          data: [+found['%KEHADIRAN'], 100 - +found['%KEHADIRAN']],
          backgroundColor: ['#4caf50', '#e0e0e0'],
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

// Muat turun PDF menggunakan html2canvas + jsPDF
function downloadPdf() {
  const el = document.querySelector('#resultCard .card');
  if (!el) {
    alert('Sila cari maklumat pelajar terlebih dahulu.');
    return;
  }

  html2canvas(el).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jspdf.jsPDF({ orientation: 'portrait' });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);
    pdf.save('Laporan_Pelajar.pdf');
  });
}
