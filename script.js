const sheetID = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g"; // Gantikan dengan ID sebenar
const sheetName = "SMB"; // Ganti dengan nama sheet
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

const table = document.getElementById("studentTable");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");
const filterInput = document.getElementById("filterInput");

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.length === 0) {
      thead.innerHTML = "<tr><th>Tiada data ditemui</th></tr>";
      return;
    }

    // Header
    const headers = Object.keys(data[0]);
    thead.innerHTML = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";

    // Table rows
    tbody.innerHTML = data.map(row =>
      `<tr>${headers.map(h => `<td>${row[h] || ""}</td>`).join("")}</tr>`
    ).join("");

    // Filter logic
    filterInput.addEventListener("input", () => {
      const keyword = filterInput.value.toLowerCase();
      const filteredRows = data.filter(row =>
        Object.values(row).some(val =>
          (val || "").toString().toLowerCase().includes(keyword)
        )
      );

      tbody.innerHTML = filteredRows.map(row =>
        `<tr>${headers.map(h => `<td>${row[h] || ""}</td>`).join("")}</tr>`
      ).join("");
    });
  })
  .catch(error => {
    alert("Gagal memuat data: " + error);
  });

// Print to PDF
document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});
