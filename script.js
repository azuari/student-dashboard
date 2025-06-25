const sheetID = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g"; // Gantikan dengan ID sebenar
const sheetSelector = document.getElementById("sheetSelector");
const table = document.getElementById("studentTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");
const filterInput = document.getElementById("filterInput");

function loadSheet(sheetName) {
  const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        thead.innerHTML = "<tr><th>Tiada data ditemui</th></tr>";
        tbody.innerHTML = "";
        return;
      }

      const headers = Object.keys(data[0]);
      thead.innerHTML = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";
      tbody.innerHTML = data.map(row =>
        `<tr>${headers.map(h => `<td>${row[h] || ""}</td>`).join("")}</tr>`
      ).join("");

      filterInput.addEventListener("input", () => {
        const keyword = filterInput.value.toLowerCase();
        const filtered = data.filter(row =>
          Object.values(row).some(val =>
            (val || "").toString().toLowerCase().includes(keyword)
          )
        );
        tbody.innerHTML = filtered.map(row =>
          `<tr>${headers.map(h => `<td>${row[h] || ""}</td>`).join("")}</tr>`
        ).join("");
      });
    })
    .catch(error => {
      alert("Gagal memuat data: " + error);
    });
}

sheetSelector.addEventListener("change", e => {
  loadSheet(e.target.value);
});

// Muatkan kali pertama
loadSheet(sheetSelector.value);

// Cetak ke PDF
document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});
