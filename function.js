function textDisappear(value, cssTxtColor) {
  let communicateWithUser = document.getElementById("userOutput");
  communicateWithUser.style.display = "block";
  communicateWithUser.innerHTML = value;
  communicateWithUser.style.color = cssTxtColor;
  setTimeout(() => {
    communicateWithUser.style.display = "none";
  }, 2500);
}



let table1data = [];
let table2data = [];
let isBillingTableProcessed = false;

function uploadFiles(event, fileId) {
  let currentFileUpload = document.getElementById(fileId);

  if (
    currentFileUpload &&
    currentFileUpload.files &&
    currentFileUpload.files.length > 0
  ) {
    

    if (fileId === "billingFile") {
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
          textDisappear("Please Check if Correct File has been Uploaded", "red");
          return;
        }

        
        table1data = dataRows.map((row) => {
          // creating a map on table1data 
          let rowData = {};
          // declaring a Object rowData for later use,
          headers.forEach((header, index) => {
            // using the headers variable from top and getting the value and index for each header
              let cleanHeader = header.trim().toLowerCase(); // Normalize header
      
              if (cleanHeader.includes("date")) {
                let dateValue = row[index];
                  rowData[header] = (dateValue && typeof dateValue === 'number') ? excelDateToJSDate(dateValue) : dateValue
              } else {
                  rowData[header] = row[index];
              }
          });
          return rowData;
      });

        isBillingTableProcessed = true;
        textDisappear(
          "Billing Data Successfully Processed!<br>Please upload Roster File",
          "rgba(1, 180, 1, 0.849)"
        );
      };
      reader.readAsBinaryString(file);
    } else if (fileId === "rosterFile") {

      if (!isBillingTableProcessed) {
        textDisappear("Please upload the Billing File first", "red");
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
          textDisappear("Please Check if Correct File has been Uploaded", "red");
          return;
        }

        let dataRows = rawData.slice(ifFirstRowEmpty ? 2 : 1);

        table2data = dataRows.map((row) => {
          let rowData = {};
          headers.forEach((header, index) => {
              let cleanHeader = header.trim().toLowerCase(); // Normalize header
      
              if (cleanHeader.includes("date")) {
                let dateValue = row[index];


                          // Check if dateValue is in a string format like "Jul 1, 2024"
                          if (dateValue && typeof dateValue === 'string') {
                              let jsDate = new Date(dateValue); // Convert string to JS Date object
                              // Format the date to MM/DD/YYYY
                              rowData[header] = jsDate instanceof Date && !isNaN(jsDate) ? 
                                  (jsDate.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                                  jsDate.getDate().toString().padStart(2, '0') + '/' + 
                                  jsDate.getFullYear() : 
                                  dateValue;
                          } else if (dateValue && typeof dateValue === 'number') {
                              rowData[header] = excelDateToJSDate(dateValue);
                          } else {
                              rowData[header] = dateValue;
                          }
                      } else {
                          rowData[header] = row[index];
                      }
                  });
              
                  return rowData;
              });
              
          
        }

        textDisappear(
          "Roster File Successfully Processed <br>Please Click Populate Roster Data to sync all data",
          "rgba(1, 180, 1, 0.849)"
        );
      
      reader.readAsBinaryString(file);
      
      }
  
}
}

// update all Paid columns in Table 2 Data to be Date of Report when Date is Selected;





const duplicates = []

let currentDateOfReport = new Date(document.getElementById('dateOfReport').value);  
  let formattedDate = currentDateOfReport.toLocaleDateString('en-US')

function updatePaidInRoster(table1data, table2data, dateOfReport) { 
  let paidQueueMap = new Map(); // Stores arrays of available 'Paid' values
  let seen = new Map(); // Tracks occurrences in table2data
  let matchedKeys = new Set(); // Tracks matched rows from table1data

  if (!(dateOfReport instanceof Date) || isNaN(dateOfReport)) {
    dateOfReport = new Date();
  }

  let formattedDate = dateOfReport.toLocaleDateString('en-US');


  let paidColumHeader = `Paid - Date of Report ${formattedDate}`;

  // Step 1: Populate queue-based lookup map from table1data
  for (let row of table1data) {
    let key = `${row.Name?.toLowerCase().trim()}|${row['Date of Service']}`;
    
    // Store multiple Paid values in an array (FIFO queue)
    if (!paidQueueMap.has(key)) {
      paidQueueMap.set(key, []);
    }

    paidQueueMap.get(key).push(row.Paid);
    
  }

  // Step 2: Update Paid and count occurrences
  for (let row of table2data) {
    let key = `${row.Name?.toLowerCase().trim()}|${row['Date of Service']}`;

    // Assign Paid from queue if available, otherwise mark as "Not Found"
    if (paidQueueMap.has(key) && paidQueueMap.get(key).length > 0) {
      row[paidColumHeader] = paidQueueMap.get(key).shift() // Take first available Paid value
      matchedKeys.add(key); // Mark as matched
    } else {
      row[paidColumHeader] = 'Was not found in Billing!';
    }

    // Track occurrences for duplicate detection
    seen.set(key, (seen.get(key) || 0) + 1);
  }

  for (let row of table1data) {
      let key = `${row.Name?.toLowerCase().trim()}|${row['Date of Service']}`;
      
      if (!matchedKeys.has(key)) {
        table2data.push({
          Name: row.Name,
          "Date of Service": row["Date of Service"],
          Paid: row.Paid
        });
        seen.set(key, (seen.get(key) || 0) + 1)
      }
    }

  // Step 3: Mark duplicates
  for (let row of table2data) {
    let key = `${row.Name?.toLowerCase().trim()}|${row['Date of Service']}`;
    row['Duplicate'] = seen.get(key) > 1; // True if more than one occurrence
  }

  // Step 4: Add unmatched rows from table1data to table2data


  

  return table2data;
}


let currentPage = 0;

let tablePages = {};


function createTable(tableId, data) {
  if(!tablePages[tableId]){
    tablePages[tableId] = 0;
  }
  
  let currentPage = tablePages[tableId];

  let table = document.getElementById(tableId);
  table.innerHTML = "";
  

  if (currentPage === 0){
    table.innerHTML = "";
  }
  let tableHeader = table.querySelector("thead");
  
  if(!tableHeader){
  tableHeader = document.createElement("thead");
  let headerRow = document.createElement("tr");

  const headers = Object.keys(data[0]);
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  tableHeader.appendChild(headerRow)
  table.appendChild(tableHeader);
}

let tablebody = table.querySelector('tbody')
if(!tablebody){
  tablebody = document.createElement('tbody');
  table.appendChild(tablebody)
}

data.forEach((row) => {
    let tr = document.createElement("tr");
    Object.keys(data[0]).forEach((header => {
      let td = document.createElement('td');
      td.textContent = row[header];
      tr.appendChild(td);
    }));
    tablebody.appendChild(tr);
  })
     
  tablePages[tableId]++;
  

  /*let existingBtn = document.getElementById('showNextPageBilling');

  existingBtn.style.visibility = 'visible';
    table.appendChild(existingBtn); // Append to the parent of the table (outside the table itself)
    */
  
}

 

// search input Function


async function searchNames (event){


  if(table1data.length < 1 || table2data.length < 1){
    textDisappear('Please', 'red')
    return
  }
    
    if(event.key === 'Enter'){
    const query = event.target.value.toLowerCase().trim();
    filterTables(query)
    
    }
  }


async function filterTables (query){
    const filterRow = (row) => {
        return Object.values(row).some(
            (value) => 
                value && value.toString().toLowerCase().includes(query)
        )
    }

    const cleanTable1= table1data.filter(filterRow)
    const cleanTable2 = table2data.filter(filterRow)

    tablePages = {}
    createTable('showBillingData', cleanTable1);
    console.log(cleanTable1)
    createTable('showRosterData', cleanTable2);
    console.log(cleanTable2)

    
    


}


function excelDateToJSDate(serial) {

  const epoch = new Date(1899, 11, 30);
  const jsDate = new Date(epoch.getTime() + serial * 86400000);

  // Extract date parts manually
  const day = jsDate.getDate().toString().padStart(2, '0');
  const month = (jsDate.getMonth() + 1).toString().padStart(2, '0');
  const year = jsDate.getFullYear();

  return `${month}/${day}/${year}`; // Returns MM/DD/YYYY format
}


// Function Save updated Table2data to Excel File.

function exportToExcel(data) {
  if (data.length === 0) {
    textDisappear("No data available to export!", "red");
    return;
  }

  // Create a worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create a workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write the file
  XLSX.writeFile(workbook, 'Bulk Roster' + ".xlsx");
}

// Example usage: export table2data when clicking a button

  






