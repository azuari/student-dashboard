const sheetID = "1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g"; // Gantikan dengan ID sebenar
const sheetName = "SMB";
const url = `https://opensheet.elk.sh/${sheetID}/${sheetName}`;

let studentData = [];

fetch(url)
  .then(response => response.json())
  .then(data => {
    studentData = data;
    renderTable(data);
    renderChart(data);
  })
  .catch(error => alert("Gagal memuat data: " + error));

function renderTable(data) {
  const table = document.getElementById("studentTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  if (data.length === 0) {
    thead.innerHTML = "<tr><th>Tiada data ditemui</th></tr>";
    return;
  }

  const headers = Object.keys(data[0]);
  thead.innerHTML = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";

  tbody.innerHTML = data.map(row => {
    return "<tr>" + headers.map(h => `<td>${row[h] || ""}</td>`).join("") + "</tr>";
  }).join("");
}

function renderCards(data) {
  const container = document.getElementById("cardContainer");
  container.innerHTML = data.map(row => {
    return `
      <div class="card">
        <h3>${row.NAMA || ""}</h3>
        <p><strong>IC:</strong> ${row.IC || ""}</p>
        <p><strong>Kelas:</strong> ${row.KELAS || ""}</p>
        <p><strong>Markah:</strong> ${row.MARKAH || ""}</p>
      </div>
    `;
  }).join("");
}

document.getElementById("toggleView").addEventListener("change", function() {
  const table = document.getElementById("studentTable");
  const cards = document.getElementById("cardContainer");
  if (this.checked) {
    table.classList.add("hidden");
    cards.classList.remove("hidden");
    renderCards(studentData);
  } else {
    cards.classList.add("hidden");
    table.classList.remove("hidden");
    renderTable(studentData);
  }
});

document.getElementById("filterInput").addEventListener("input", function() {
  const keyword = this.value.toLowerCase();
  const filtered = studentData.filter(row => {
    return Object.values(row).some(val => (val || "").toLowerCase().includes(keyword));
  });
  if (document.getElementById("toggleView").checked) {
    renderCards(filtered);
  } else {
    renderTable(filtered);
  }
});

document.getElementById("printBtn").addEventListener("click", function() {
  window.print();
});

function renderChart(data) {
  const ctx = document.getElementById("grafPelajar").getContext("2d");
  const kelasMarkah = {};

  data.forEach(row => {
    const kelas = row.KELAS || "Lain-lain";
    const markah = parseFloat(row.MARKAH || 0);
    if (!kelasMarkah[kelas]) kelasMarkah[kelas] = [];
    kelasMarkah[kelas].push(markah);
  });

  const labels = Object.keys(kelasMarkah);
  const avgMarkah = labels.map(k => {
    const sum = kelasMarkah[k].reduce((a, b) => a + b, 0);
    return (sum / kelasMarkah[k].length).toFixed(2);
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Purata Markah Mengikut Kelas",
        data: avgMarkah,
        backgroundColor: "#007bff"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
