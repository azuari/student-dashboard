// Tentukan ID dan nama sheet anda
const sheetID = '1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g';
const sheets = ['SMB','SMS','SMO','SMV'];
let students = [];

document.addEventListener('DOMContentLoaded', () => {
  const kursusSel = document.getElementById('courseSelect');
  sheets.forEach(s => kursusSel.add(new Option(s, s)));

  document.getElementById('filter-btn')
    .addEventListener('click', loadStudents);
  document.getElementById('studentSelect')
    .addEventListener('change', showStudentInfo);
  document.getElementById('download-btn')
    .addEventListener('click', downloadPDF);
});

function loadStudents(){
  const sheet = document.getElementById('courseSelect').value;
  if(!sheet) return alert('Sila pilih kursus');

  fetch(`https://opensheet.elk.sh/${sheetId}/${sheet}`)
    .then(r => r.json())
    .then(data => {
      students = data;
      const sel = document.getElementById('studentSelect');
      sel.innerHTML = '<option value="">-- Pilih Pelajar --</option>';
      data.forEach(r => {
        sel.add(new Option(r['NAMA'], r['IC']));
      });

      document.getElementById('infoCard').classList.add('hidden');
      document.getElementById('attendanceChart').classList.add('hidden');
      document.getElementById('download-btn').classList.add('hidden');
    })
    .catch(e => alert('Gagal muat pelajar: ' + e));
}

function showStudentInfo(){
  const ic = this.value;
  const info = students.find(r => r['IC'] === ic);
  if(!info) return;

  document.getElementById('infoCode').textContent = info['KOD KELAS'] || '';
  document.getElementById('infoName').textContent = info['NAMA'] || '';
  document.getElementById('infoIC').textContent = info['IC'] || '';

  document.getElementById('infoCard').classList.remove('hidden');
  renderChart(info);
  document.getElementById('attendanceChart').classList.remove('hidden');
  document.getElementById('download-btn').classList.remove('hidden');
}

function renderChart(info){
  const ctx = document.getElementById('attendanceChart').getContext('2d');
  if(window.chart) window.chart.destroy();

  const percent = parseFloat(info['%KEHADIRAN']) || 0;
  const not = 100 - percent;

  window.chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Kehadiran','Tidak Hadir'],
      datasets:[{
        data:[percent, not],
        backgroundColor:['#007bff','#e9ecef']
      }]
    },
    options:{
      responsive:true,
      cutout: '70%',
      plugins:{ legend: { position:'bottom', labels:{ font:{ size:12 } } } }
    }
  });
}

function downloadPDF(){
  const card = document.querySelector('.main-card');
  html2canvas(card).then(canvas => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({orientation:'portrait', format:'a4'});
    const img = canvas.toDataURL('image/png');
    const pdfW = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(img,'PNG',0,0,pdfW,h);
    pdf.save('DashboardPelajar.pdf');
  });
}
