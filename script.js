const map = L.map('map', {

  zoomControl: false

}).setView([-7.96301, 112.615822], 13);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19
  }
).addTo(map);

L.control.zoom({

  position: 'bottomright'

}).addTo(map);

// =========================
// ARRAY MARKER
// =========================

let markers = {};

// =========================
// TRAIN MARKER
// =========================

const trainIcon = L.icon({

  iconUrl: 'train.png',

  iconSize: [50, 50],

  iconAnchor: [25, 25],

  popupAnchor: [0, -20]

});

// =========================
// PARAMETER UNITS
// =========================

const units = {

  "Engine Speed": "RPM",
  "Battery Voltage": "VDC",
  "Charger Alternator": "VDC",

  "Oil Pressure": "Bar",
  "Coolant Temp": "°C",
  "Oil Temperature": "°C",

  "Fuel Level Daily Tank": "%",
  "Generator Percentage Power": "%",

  "Gen Freq": "Hz",

  "L1-N": "VAC",
  "L2-N": "VAC",
  "L3-N": "VAC",

  "L1-L2": "VAC",
  "L2-L3": "VAC",
  "L3-L1": "VAC",

  "Gen L1": "A",
  "Gen L2": "A",
  "Gen L3": "A",

  "Power L1": "kW",
  "Power L2": "kW",
  "Power L3": "kW",
  "Power Total": "kW",

  "Voltage (R)": "VAC",
  "Voltage (S)": "VAC",
  "Voltage (T)": "VAC",

  "Current (R)": "A",
  "Current (S)": "A",
  "Current (T)": "A",

  "Power (R)": "W",
  "Power (S)": "W",
  "Power (T)": "W",

  "Energy (R)": "kWh",
  "Energy (S)": "kWh",
  "Energy (T)": "kWh",

  "Fuel Delivery Pump": "Bar",
  "Fuel Temperature": "°C",
  "Fuel Consumption": "L/H"

};

// =========================
// LOAD DATA
// =========================

async function loadData() {

  try {

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxWweS6KqpC9CkIcWz0peHfxfeawWVf-BqXo0QAUuXCvtNNuXlpt1PC1vOdmPDgIXNSAw/exec'
    );

    const data = await response.json();

    console.log(data);

    // CLEAR SIDEBAR
    document.getElementById("generator-list").innerHTML = "";

    data.forEach(unit => {

      const lat = parseFloat(unit.Latitude);
      const lng = parseFloat(unit.Longitude);

      if (isNaN(lat) || isNaN(lng))
        return;

      // =========================
      // AUTO TABLE
      // =========================

      let tableRows = "";

      for (const key in unit) {

        // skip koordinat
        if (
          key === "Latitude" ||
          key === "Longitude"
        ) continue;

        let value = unit[key];

        // =====================
        // FORMAT LOCATION
        // =====================

        if (key === "Location" && value) {

          const lat = unit["Latitude"];
          const lng = unit["Longitude"];

          value = `
            <a href="https://www.google.com/maps?q=${lat},${lng}"
              target="_blank"
              style="color:#38bdf8; text-decoration:none;">
              ${value}
            </a>
          `;
        }

        // FORMAT TIMESTAMP

        if (key === "Timestamp" && value) {

          const date = new Date(value);

          value = date.toLocaleString("id-ID", {

            timeZone: "Asia/Jakarta"

          });

        }

        let unitText = units[key] || "";

        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          value = "-";
        }

        tableRows += `

          <tr>
            <td>${key === "Device" ? "Generator" : key}</td>
            <td>${value} ${unitText}</td>
          </tr>

        `;
      }

      // =========================
      // POPUP HTML
      // =========================

      const popupContent = `

      <div class="popup">

        <h2>${unit.Device}</h2>

        <div class="popup-table-wrapper">

          <table class="popup-table">

            ${tableRows}

          </table>

        </div>

      </div>

    `;

      // =========================
      // UPDATE MARKER
      // =========================

      if (markers[unit.Device]) {

        markers[unit.Device]
          .setLatLng([lat, lng])
          .setPopupContent(popupContent);

      }

      // =========================
      // CREATE MARKER
      // =========================

      else {

        const marker = L.marker(
          [lat, lng],
          { icon: trainIcon }
        )
        .addTo(map)
        .bindPopup(popupContent);

        markers[unit.Device] = marker;

      }

      // =========================
      // STATUS COLOR
      // =========================

      let statusClass = "status-off";

      if (unit["Engine Status"] === "ON") {

        statusClass = "status-on";

      }

      // =========================
      // SIDEBAR CARD
      // =========================

      const card = document.createElement("div");

      card.className = "generator-card";

      let formattedTime = "-";

      if(unit["Timestamp"]) {

        formattedTime = new Date(
          unit["Timestamp"]
        ).toLocaleString("id-ID", {

          timeZone: "Asia/Jakarta"

        });

      }

      card.innerHTML = `

      <div class="generator-title">
        ${unit.Device}
      </div>

      <div class="generator-data">
        Engine Status :
        <span class="${statusClass}">
          ${unit["Engine Status"] || "-"}
        </span>
      </div>

      <div class="generator-data">
        Time : ${formattedTime}
      </div>

      <div class="generator-data">
        RPM : ${unit["Engine Speed"] || "-"} RPM
      </div>

      <div class="generator-data">
        Battery : ${unit["Battery Voltage"] || "-"} VDC
      </div>

      <div class="generator-data">
        Engine Temp : ${unit["Coolant Temp"] || "-"} °C
      </div>

      <div class="generator-data">
        Fuel Consumption : ${unit["Fuel Consumption"] || "-"} L/H
      </div>

      <div class="generator-data">
        Power : ${unit["Power Total"] || "-"} kW
      </div>

    `;

      // =========================
      // CARD CLICK
      // =========================

      card.addEventListener("click", () => {

        // tutup semua popup
        Object.values(markers).forEach(marker => {

          marker.closePopup();

        });

        // fokus ke marker
        map.setView([lat, lng], 16);

        // buka popup baru
        markers[unit.Device].openPopup();

      });

      // TAMBAHKAN CARD
      document
        .getElementById("generator-list")
        .appendChild(card);

    });

  } catch(error) {

    console.log(error);

  }

}

// =========================
// LOAD PERTAMA
// =========================

loadData();

// =========================
// REFRESH REALTIME
// =========================

setInterval(loadData, 5000);

// =========================
// SIDEBAR TOGGLE
// =========================

const toggleBtn = document.getElementById("toggleSidebar");

const sidebar = document.querySelector(".sidebar");

toggleBtn.addEventListener("click", () => {

  sidebar.classList.toggle("closed");

  setTimeout(() => {

    map.invalidateSize();

  }, 300);

});

// =========================
// CLICK MAP = CLOSE POPUP
// =========================

map.on("click", () => {

  Object.values(markers).forEach(marker => {

    marker.closePopup();

  });

});
