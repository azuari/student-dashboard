const sheetUrl = 'https://opensheet.elk.sh/1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g/SMB';
let attendanceChart;

window.addEventListener('DOMContentLoaded', init);

function init() {
  document.getElementById('filter-btn').addEventListener('click', loadData);
  document.getElementById('download-btn').addEventListener('click', downloadPDF);
  setupChart();
}

function setupChart() {
  const ctx = document.getElementById('attendanceChart').getContext('2d');
  attendanceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Hadir', 'Tidak Hadir'],
      datasets: [{
        data: [0, 0],
        backgroundColor: ['#46BFBD', '#F7464A'],
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function loadData() {
  const code = document.getElementById('filter-class').value.trim();
  if (!code) return alert('Sila masukkan kod kelas.');

  fetch(sheetUrl)
    .then(resp => resp.json())
    .then(data => {
      const filtered = data.filter(r => r['KOD KELAS'] === code);
      displayCards(filtered);
      updateChart(filtered);
    })
    .catch(err => alert('Gagal memuat data: ' + err));
}

function displayCards(rows) {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  rows.forEach(r => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <strong>${r['NAMA']}</strong><br>
      IC: ${r['IC']}<br>
      Kelas: ${r['KOD KELAS']}
    `;
    container.appendChild(div);
  });
}

function updateChart(rows) {
  const hadirCount = rows.filter(r => parseFloat(r['%KEHADIRAN']) >= 50).length;
  const tidakCount = rows.length - hadirCount;
  attendanceChart.data.datasets[0].data = [hadirCount, tidakCount];
  attendanceChart.update();
}

function downloadPDF() {
  alert('Fungsi PDF akan datang 😊');
}
