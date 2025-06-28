window.html2canvas = html2canvas; // penting untuk jsPDF :contentReference[oaicite:9]{index=9}
const { jsPDF } = window.jspdf;
const sheetId = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g"; 
const tabs = ["SMB","SMS","SMO","SMV"];
let allData = {}, currentChart = null;

tabs.forEach(tab=>{
  fetch(`https://opensheet.elk.sh/${sheetId}/${tab}`)
    .then(r=>r.json()).then(rows=>{
      allData[tab] = rows;
      if(Object.keys(allData).length===tabs.length){
        const sel = document.getElementById("courseSelect");
        tabs.forEach(t=>{
          const o=document.createElement("option"); o.value=o.textContent=t; sel.append(o);
        });
      }
    }).catch(console.error);
});

document.getElementById("courseSelect").addEventListener("change",()=>{
  const sel = document.getElementById("studentSelect");
  sel.innerHTML = `<option value="">--Pilih--</option>`;
  allData[document.getElementById("courseSelect").value]?.forEach(r=>{
    const o=document.createElement("option"); o.value=o.textContent=r["NAMA"]; sel.append(o);
  });
});

document.getElementById("filter-btn").addEventListener("click",()=>{
  const c = document.getElementById("courseSelect").value;
  const s = document.getElementById("studentSelect").value;
  if(!c||!s) return;
  const rec = allData[c].find(r=>r["NAMA"]===s);
  if(!rec) return;
  // Isikan info fields...
  document.getElementById("infoCard").classList.remove("hidden");
 const ctx = document.getElementById("attendanceChart").getContext('2d');
  document.querySelector('.chart-container').classList.remove('hidden');
  if (currentChart) currentChart.destroy();

  currentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Hadir', 'Tidak Hadir'],
      datasets: [{
        data: [rec["%KEHADIRAN"], 100 - rec["%KEHADIRAN"]],
        backgroundColor: ['#4caf50','#f44336']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          color: '#fff',
          formatter: v => v + '%'
        },
        legend: {position: 'bottom'}
      }
    },
    plugins: [ChartDataLabels]
  });
}
document.getElementById("download-btn").addEventListener("click",()=>{
  html2canvas(document.querySelector(".main-card"),{scale:2}).then(canvas=>{
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF('p','pt','a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = canvas.height * w / canvas.width;
    pdf.addImage(img,'PNG',0,20,w,h);
    pdf.save("pelajar.pdf");
  });
});

document.getElementById("reset-btn").addEventListener("click",()=>{
  document.getElementById("courseSelect").value="";
  document.getElementById("studentSelect").innerHTML=`<option value="">--Pilih--</option>`;
  document.getElementById("infoCard").classList.add("hidden");
  document.querySelector(".chart-container").classList.add("hidden");
  document.getElementById("download-btn").classList.add("hidden");
  currentChart?.destroy();
  currentChart = null;
});
