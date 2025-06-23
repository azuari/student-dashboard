const sheetID = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g"; // Gantikan dengan ID sebenar
const sheetName = "SMB"; // Ganti dengan nama sheet
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

document.addEventListener("DOMContentLoaded", function () {
  fetchData();
});

function fetchData() {
  fetch(url)
    .then(res => res.json())
    .then(data => populateTable(data))
    .catch(err => alert("Gagal ambil data: " + err));
}

function populateTable(data) {
  const table = document.getElementById("studentTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  if (!data.length) {
    thead.innerHTML = "<tr><th>Tiada data ditemui</th></tr>";
    return;
  }

  const headers = Object.keys(data[0]);
  thead.innerHTML = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";

  tbody.innerHTML = data.map(row => {
  return "<tr>" + headers.map(h => `<td data-label="${h}">${row[h] || ""}</td>`).join("") + "</tr>";
}).join("");

}

function printTable() {
  window.print();
}

function showSummary(data) {
  const summaryDiv = document.getElementById("summary");
  const total = data.length;
  let hadir = 0;

  data.forEach(row => {
    const hadirVal = parseInt(row["%KEHADIRAN"]);
    if (!isNaN(hadirVal) && hadirVal >= 80) hadir++;
  });

  summaryDiv.innerHTML = `
    <h3>Ringkasan</h3>
    <p>Jumlah Pelajar: ${total}</p>
    <p>Pelajar Hadir ≥ 80%: ${hadir}</p>
    <p>Peratusan Hadir Tinggi: ${(hadir/total*100).toFixed(1)}%</p>
  `;
}

