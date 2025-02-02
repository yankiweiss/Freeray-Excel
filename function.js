function textDisapear(value, cssTxtColor) {
  let comunicateWithUser = document.getElementById("userOutput");
  comunicateWithUser.style.display = "block";
  comunicateWithUser.innerHTML = value;
  comunicateWithUser.style.color = cssTxtColor;
  setTimeout(() => {
    comunicateWithUser.style.display = "none";
  }, 2500);
}

let table1data = [];
let table2data = [];
let isBillingTableProcessed = false;

function uplaodFiles(event, tableId) {
  let currentFileUpload = document.getElementById(tableId);

  if (
    currentFileUpload &&
    currentFileUpload.files &&
    currentFileUpload.files.length > 0
  ) {
    console.log("Uplaoded file is from table:", tableId);

    if (tableId === "billingFile") {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (event) {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        let rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let firstRow = rawData[0] || [];
        let secondRow = rawData[1] || [];

        const ifFirstRowEmpty = firstRow.every(
          (cell) => cell === "" || cell === null
        );

        let headers = ifFirstRowEmpty ? secondRow : firstRow;

        headers = headers.map((header) => header.trim());

        let dataRows = rawData.slice(ifFirstRowEmpty ? 2 : 1);

        let allHeaders = headers;

        if (!allHeaders.includes("Paid")) {
          textDisapear("Please Check if Correct File has been Uploaded", "red");
          return;
        }
        table1data = dataRows.map((row) => {
          let rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        });

        //createTable('table1data', table1data)

        // Need to Render the Table1Data in the HTML Page
        isBillingTableProcessed = true;
        textDisapear(
          "Billing Data Sucseesfuly Proceseed!<br>Please uplaod Roster File",
          "rgba(1, 180, 1, 0.849)"
        );
      };
      reader.readAsBinaryString(file);
    } else if (tableId === "rosterFile") {
      if (!isBillingTableProcessed) {
        textDisapear("Please upload the Billing File first", "red");
        return;
      }
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function (event) {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        let rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let firstRow = rawData[0] || [];
        let secondRow = rawData[1] || [];

        const ifFirstRowEmpty = firstRow.every(
          (cell) => cell === "" || cell === null
        );

        let headers = ifFirstRowEmpty ? secondRow : firstRow;

        headers = headers.map((header) => header.trim());

        let allHeaders = headers;

        if (allHeaders.includes("Paid")) {
          textDisapear("Please Check if Correct File has been Uploaded", "red");
          return;
        }

        let dataRows = rawData.slice(ifFirstRowEmpty ? 2 : 1);

        table2data = dataRows.map((row) => {
          let rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        });

        populateRoster(table1data, table2data);
        textDisapear(
          "Roster Data has been Sucssesfuly Uploaded, <br>Please hang on while we return the data",
          "green"
        );
      };
      reader.readAsBinaryString(file);
    }
  } else {
    console.log("No file was upalod", tableId);
  }
}

function populateRoster(table1data, table2data) {
  let matchCount = 0;
  let matchedNames = [];

  for (let i = 0; i < table2data.length; i++) {
    const row2 = table2data[i];
    for (let j = 0; j < table1data.length; j++) {
      const row1 = table1data[j];

      if (row2.Name?.toLowerCase().trim() === row1.Name?.toLowerCase().trim()) {
        matchedNames.push(row2.Name);
        matchCount++;
        break;
      }
    }
  }
}



function createTable(tableId, data) {
   
  let table = document.getElementById(tableId);

  if (data.length < 1) {
    textDisapear("You first need to upload the Files", "red");
    return;
  }
  table.innerHTML = "";
  

  let tableHeader = document.createElement("thead");
  let headerRow = document.createElement("tr");

  const headers = Object.keys(data[0]);

  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  tableHeader.appendChild(headerRow);
  let tabelHeadings = table.appendChild(tableHeader);

  data.forEach((row) => {
    let tr = document.createElement("tr");
    headers.forEach((header) => {
      let td = document.createElement("td");
      td.textContent = row[header];
      tr.appendChild(td);
    });
    tabelHeadings.appendChild(tr);
  });

  table.appendChild(tabelHeadings);
}
