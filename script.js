const map = L.map('map').setView([-7.96301, 112.615822], 13);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19
  }
).addTo(map);

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

    // FETCH DATA

    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbwUBct1xLizTPlIFwrugLZzavMrKJ5uCuOeCDCGnDBoBoiHIydWuaKWVLRxuZHdj7_r/exec'
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
      // POPUP CONTENT
      // =========================

      // =====================
// AUTO GENERATE TABLE
// =====================

let tableRows = "";

for (const key in unit) {

  // skip koordinat agar popup tidak terlalu panjang
  if (
    key === "Latitude" ||
    key === "Longitude"
  ) continue;

 // =====================
// UNIT
// =====================

let value = unit[key];

let unitText = units[key] || "";

// kosongkan undefined/null

if (
  value === undefined ||
  value === null ||
  value === ""
) {

  value = "-";

}

// =====================
// BUILD TABLE
// =====================

tableRows += `

  <tr>
    <td>${key}</td>
    <td>${value} ${unitText}</td>
  </tr>

`;
}

// =====================
// POPUP HTML
// =====================

const popupContent = `

  <div class="popup">

    <h2>${unit.Device}</h2>

    <table>

      ${tableRows}

    </table>

  </div>

`;

      // =========================
      // JIKA MARKER SUDAH ADA
      // =========================

      if (markers[unit.Device]) {

        markers[unit.Device]
          .setLatLng([lat, lng])
          .setPopupContent(popupContent);

      }

      // =========================
      // JIKA MARKER BELUM ADA
      // =========================

      else {

        const marker = L.marker([lat, lng],{icon: trainIcon})
        .addTo(map)
        .bindPopup(popupContent);

        markers[unit.Device] = marker;        

      }

      // =========================
      // STATUS
      // =========================

      let statusClass = "status-off";

      if(unit["Engine Status"] === "ON"){

        statusClass = "status-on";

      }

      // =========================
      // SIDEBAR CARD
      // =========================

      const card = document.createElement("div");

      card.className = "generator-card";

      card.innerHTML = `
        <div class="generator-title">
          ${unit.Device}
        </div>

        <div class="generator-data">
          Status :
          <span class="${statusClass}">
            ${unit["Engine Status"]}
          </span>
        </div>

        <div class="generator-data">
          RPM : ${unit.RPM}
        </div>

        <div class="generator-data">
          Battery : ${unit["Battery Voltage"]} V
        </div>

        <div class="generator-data">
          Fuel : ${unit["Fuel Level"]} %
        </div>

        <div class="generator-data">
          Power : ${unit["Generator Power"]} kW
        </div>
      `;

      // KLIK CARD

      card.addEventListener("click", () => {

        map.setView([lat, lng], 16);

        markers[unit.Device].openPopup();

      });

      document
      .getElementById("generator-list")
      .appendChild(card);

    });

  } catch(error) {

    console.log(error);

  }

}

// LOAD PERTAMA

loadData();

// REFRESH REALTIME

setInterval(loadData, 5000);