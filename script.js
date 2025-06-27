// Tentukan ID dan nama sheet anda
const sheetID = '1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g';
const kursusSheet = 'MASTER'; // sheet kursus & pelajar

let courses = [], students = [];

document.addEventListener('DOMContentLoaded', () => {
  loadData();

  document.getElementById('filter-btn')
    .addEventListener('click', filterStudent);

  document.getElementById('download-btn')
    .addEventListener('click', downloadPDF);
});

function loadData(){
  const url = `https://opensheet.elk.sh/${sheetId}/${kursusSheet}`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      const sel = document.getElementById('courseSelect');
      courses = [...new Set(data.map(r => r['KURSUS']))];
      courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.text = c;
        sel.append(opt);
      });
      students = data; 
    })
    .catch(e => alert('Gagal muat kursus: ' + e));
}

function filterStudent(){
  const kursus = document.getElementById('courseSelect').value;
  const filtered = students.filter(r => r['KURSUS'] === kursus);
  const sel = document.getElementById('studentSelect');
  sel.innerHTML = '';
  filtered.forEach(r => {
    const o = document.createElement('option');
    o.value = r['IC'];
    o.text = `${r['KOD KELAS']} • ${r['NAMA']}`;
    sel.append(o);
  });
}

function showInfo(){
  const ic = document.getElementById('studentSelect').value;
  return students.find(r => r['IC'] === ic);
}

function filterStudent(){
  const info = showInfo();
  if(!info){
    alert('Sila pilih pelajar');
    return;
  }
  document.getElementById('infoCard').classList.remove('hidden');
  document.getElementById('infoCode').textContent = info['KOD KELAS'];
  document.getElementById('infoName').textContent = info['NAMA'];
  document.getElementById('infoIC').textContent = info['IC'];

  renderChart(info);
  document.getElementById('attendanceChart').classList.remove('hidden');
  document.getElementById('download-btn').classList.remove('hidden');
}

function renderChart(info){
  const ctx = document.getElementById('attendanceChart').getContext('2d');
  if(window.chart) window.chart.destroy();

  window.chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Kehadiran', 'Tiada'],
      datasets: [{
        data: [
          parseFloat(info['%KEHADIRAN']),
          100 - parseFloat(info['%KEHADIRAN'])
        ],
        backgroundColor: ['#007bff', '#e9ecef']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '70%',
      plugins: { legend: { position: 'bottom', labels: { font: { size: 12 } } } }
    }
  });
}

function downloadPDF(){
  const card = document.querySelector('.main-card');
  html2canvas(card).then(canvas => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({orientation:'portrait', unit:'pt', format:'a4'});
    const img = canvas.toDataURL('image/png');
    const imgProps = pdf.getImageProperties(img);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('DashboardPelajar.pdf');
  });
}
