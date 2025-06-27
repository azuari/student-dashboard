const sheetId = '1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g';
const courses = ['SMB','SMO','SMS','SMV'];

document.addEventListener('DOMContentLoaded', () => {
  const selCourse = document.getElementById('courseSelect');
  selCourse.innerHTML = '<option value="">-- Pilih Kursus --</option>' +
    courses.map(c => `<option>${c}</option>`).join('');

  selCourse.addEventListener('change', loadStudents);
  document.getElementById('filter-btn').addEventListener('click', showStudent);
  document.getElementById('reset-btn').addEventListener('click', resetAll);
});

let studentsData = [];

async function loadStudents(){
  const course = this.value;
  resetAll(true);
  if (!course) return;

  const url = `https://opensheet.elk.sh/${sheetId}/${course}`;
  try {
    studentsData = await (await fetch(url)).json();
    const selStu = document.getElementById('studentSelect');
    selStu.innerHTML = '<option value="">-- Pilih Pelajar --</option>' +
      studentsData.map(r => `<option value="${r.NAMA}">${r.NAMA}</option>`).join('');
    selStu.disabled = false;
  } catch(err){
    alert('Gagal muat data pelajar: '+ err);
  }
}

function showStudent(){
  const name = document.getElementById('studentSelect').value;
  if (!name) return;

  const rec = studentsData.find(r => r.NAMA === name);
  if (!rec) return;

  document.getElementById('infoCard').classList.remove('hidden');
  ['infoCode','infoName','infoIC'].forEach(id => {
    document.getElementById(id).textContent = rec['KOD KELAS'] || rec['IC'] || rec['NAMA'];
  });

  // Chart Plot
  const ctx = document.getElementById('attendanceChart');
  ctx.classList.remove('hidden');
  new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['Kehadiran','Tidak hadir'],
      datasets: [{
        data: [+rec['%KEHADIRAN'], 100 - (+rec['%KEHADIRAN'] || 0)],
        backgroundColor: ['#4caf50','#e0e0e0']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  document.getElementById('download-btn').classList.remove('hidden');
}

function resetAll(fromCourse=false){
  document.getElementById('studentSelect').innerHTML = '<option>-- Pilih Pelajar --</option>';
  document.getElementById('studentSelect').disabled = true;
  if (!fromCourse){
    document.getElementById('courseSelect').value = '';
  }
  ['infoCard','attendanceChart','download-btn'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
}
