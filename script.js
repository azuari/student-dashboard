const sheetID = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g"; // Gantikan dengan ID sebenar
const sheetName = "SMB"; // Ganti dengan nama sheet
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

// Load and render data
document.addEventListener("DOMContentLoaded", () => {
  fetchData();

  document.getElementById("filterInput").addEventListener("input", filterTable);
  document.getElementById("printBtn").addEventListener("click", () => window.print());
});

function fetchData() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      renderTable(data);
    })
    .catch((error) => {
      alert("Gagal memuat data: " + error);
    });
}

function renderTable(data) {
  const table = document.getElementById("studentTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  if (!data.length) {
    thead.innerHTML = "<tr><th>Tiada data ditemui</th></tr>";
    tbody.innerHTML = "";
    return;
  }

  const headers = Object.keys(data[0]);
  thead.innerHTML = "<tr>" + headers.map((h) => `<th>${h}</th>`).join("") + "</tr>";

  tbody.innerHTML = data.map((row) => {
    return (
      "<tr>" +
      headers.map((h) => `<td>${row[h] || ""}</td>`).join("") +
      "</tr>"
    );
  }).join("");
}

function filterTable() {
  const input = document.getElementById("filterInput").value.toLowerCase();
  const rows = document.querySelectorAll("#studentTable tbody tr");

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(input) ? "" : "none";
  });
}
