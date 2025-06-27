const sheetId = '1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g'; // ID anda
const tabs = ['SMB','SMO','SMS','SMV'];

const courseSel = document.getElementById('courseSelect');
const studentSel = document.getElementById('studentSelect');
const loadBtn = document.getElementById('loadBtn');
const resetBtn = document.getElementById('resetBtn');
const infoCard = document.getElementById('infoCard');
const infoCode = document.getElementById('infoCode');
const infoName = document.getElementById('infoName');
const infoIC = document.getElementById('infoIC');
const chartCtx = document.getElementById('attendanceChart');
const downloadBtn = document.getElementById('downloadBtn');
let chart;

tabs.forEach(t => {
  let opt = document.createElement('option');
  opt.value = t; opt.textContent = t;
  courseSel.appendChild(opt);
});

courseSel.addEventListener('change', () => {
  const tab = courseSel.value;
  resetStudent();
  if (!tab) return;
  fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
    .then(r => r.json())
    .then(data => {
      studentSel.innerHTML = '<option value="">Pilih Pelajar …</option>';
      data.forEach(r => {
        let o = document.createElement('option');
        o.value = JSON.stringify(r);
        o.textContent = r.NAMA;
        studentSel.appendChild(o);
      });
      studentSel.disabled = false;
    })
    .catch(() => alert('Gagal memuat data kursus'));
});

loadBtn.addEventListener('click', () => {
  const sel = studentSel.value;
  if (!sel) return alert('Sila pilih pelajar');
  const d = JSON.parse(sel);
  infoCode.textContent = d['KOD KELAS'];
  infoName.textContent = d['NAMA'];
  infoIC.textContent = d['IC'];
  infoCard.classList.remove('hidden');
  renderChart(d['%KEHADIRAN']);
  downloadBtn.classList.remove('hidden');
});

studentSel.addEventListener('change', () => {
  loadBtn.disabled = !studentSel.value;
});

resetBtn.addEventListener('click', () => {
  courseSel.value = '';
  resetStudent();
  infoCard.classList.add('hidden');
  chartCtx.classList.add('hidden');
  downloadBtn.classList.add('hidden');
  if (chart) chart.destroy();
});

function resetStudent(){
  studentSel.disabled = true;
  studentSel.innerHTML = '<option value="">Pilih Pelajar …</option>';
  loadBtn.disabled = true;
}

function renderChart(percent){
  chartCtx.classList.remove('hidden');
  if (chart) chart.destroy();
  chart = new Chart(chartCtx, {
    type: 'doughnut',
    data: {
      labels: ['Kehadiran','Kehilangan'],
      datasets: [{ data: [Number(percent), 100 - Number(percent)], backgroundColor: ['#00aaff','#ddd'] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}
