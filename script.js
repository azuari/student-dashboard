document.addEventListener("DOMContentLoaded", () => {
  const fetchURL = "https://opensheet.elk.sh/1sGcf2OXu9DjStT2QZs1oxKen9kLYYzrsRkMGP4bQ-1g/SMB";
  const tableBody = document.querySelector("#studentTable tbody");
  const filterCourse = document.getElementById("filterCourse");
  const filterCode = document.getElementById("filterCode");
  const filterBtn = document.getElementById("filterBtn");
  const cardContainer = document.getElementById("cardContainer");

  let data = [];

  fetch(fetchURL)
    .then(r => r.json())
    .then(json => {
      data = json;
      renderTable(data);
    })
    .catch(e => {
      alert("Gagal muat data: " + e);
    });

  filterBtn.addEventListener("click", () => {
    const code = filterCode.value.trim().toUpperCase();
    const filtered = data.filter(d => d["KOD KELAS"]?.toUpperCase() === code);
    renderCard(filtered[0]);
  });

  function renderTable(data) {
    tableBody.innerHTML = data.map(row => `
      <tr>
        <td>${row["KOD KELAS"] || ""}</td>
        <td>${row["NAMA"] || ""}</td>
        <td>${row["IC"] || ""}</td>
      </tr>`).join("");
  }

  function renderCard(row) {
    cardContainer.innerHTML = "";
    if (!row) {
      cardContainer.innerHTML = "<p>Tiada data untuk kod kelas tersebut.</p>";
      return;
    }
    const card = document.createElement("div");
    card.className = "card";
    const nama = row["NAMA"];
    const ic = row["IC"];
    const kehadiran = parseFloat(row["%KEHADIRAN"]) || 0;
    card.innerHTML = `
      <h3>${nama}</h3>
      <p>IC: ${ic}</p>
      <div class="progress-container">
        <div class="progress-bar" style="width:${kehadiran}%">
          ${kehadiran}%
        </div>
      </div>`;
    cardContainer.appendChild(card);
  }
});
