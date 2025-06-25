const sheetID = '1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g';
const sheetName = 'SMB';
const baseURL = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

const container = document.querySelector('.container');

fetch(baseURL)
  .then(r => r.json())
  .then(data => initDashboard(data))
  .catch(e => alert('Gagal memuat data: ' + e));

function initDashboard(data) {
  container.innerHTML = `
    <h2>Dashboard Maklumat Pelajar</h2>
    <div id="filterBar">
      <input type="text" id="filterClass" placeholder="Masukkan Kod Kelas">
      <input type="text" id="filterName" placeholder="Masukkan Nama">
      <button id="searchBtn">Cari</button>
    </div>
    <table id="studentTable"><thead><tr><th>KOD KELAS</th><th>NAMA</th><th>IC</th></tr></thead><tbody></tbody></table>
    <div id="resultCard"></div>
    <button id="downloadPdf">Muat Turun PDF</button>
  `;

  const tbody = document.querySelector('#studentTable tbody');
  data.forEach(r => {
    tbody.innerHTML += `<tr><td>${r['KOD KELAS']}</td><td>${r['NAMA']}</td><td>${r['IC']}</td></tr>`;
  });

  document.getElementById('searchBtn').onclick = () => searchStudent(data);
}

function searchStudent(data) {
  const kc = document.getElementById('filterClass').value.trim().toLowerCase();
  const nm = document.getElementById('filterName').value.trim().toLowerCase();
  const found = data.find(r =>
    r['KOD KELAS'].toLowerCase().includes(kc) &&
    r['NAMA'].toLowerCase().includes(nm)
  );
  const result = document.getElementById('resultCard');
  result.innerHTML = '';
  if (!found) {
    result.textContent = 'Tiada pelajar ditemui';
    return;
  }

  result.innerHTML = `
    <div class="student-card">
      <h3>${found['NAMA']} (${found['IC']})</h3>
      <p><strong>Kod Kelas:</strong> ${found['KOD KELAS']}</p>
      <div class="canvas-container"><canvas id="attendanceChart"></canvas></div>
    </div>
  `;

  const ctx = document.getElementById('attendanceChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Kehadiran', 'Tidak Hadir'],
      datasets: [{
        label: '% Kehadiran',
        data: [parseFloat(found['%KEHADIRAN']), 100 - parseFloat(found['%KEHADIRAN'])],
        backgroundColor: ['#28a745', '#dc3545']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

document.getElementById('downloadPdf').onclick = () => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const elem = document.querySelector('.student-card');
  if (!elem) { alert('Tiada data untuk PDF'); return; }

  html2canvas(elem, { scale: 2 }).then(canvas => {
    const img = canvas.toDataURL('image/jpeg', 1.0);
    const w = doc.internal.pageSize.getWidth() - 40;
    const h = canvas.height * w / canvas.width;
    doc.addImage(img, 'JPEG', 20, 20, w, h);
    doc.save(`Laporan_${Date.now()}.pdf`);
  });
};
