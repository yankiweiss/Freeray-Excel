function updatePaidInRoster(table1data, table2data) { 
    let paidQueueMap = new Map(); // Stores arrays of available 'Paid' values
    let seen = new Map(); // Tracks occurrences in table2data
    let matchedKeys = new Set(); // Tracks matched rows from table1data
  
    // Step 1: Populate queue-based lookup map from table1data
    for (let row of table1data) {
      let key = `${row.Name?.toLowerCase().trim()}|${row['Date of Service']}`;
      
      // Store multiple Paid values in an array (FIFO queue)
      if (!paidQueueMap.has(key)) {
        paidQueueMap.set(key, []);
      }

      paidQueueMap.get(key).push(row.Paid);
      console.log(paidQueueMap)
    }
  
    // Step 2: Update Paid and count occurrences
    for (let row of table2data) {
      let key = `${row.Name?.toLowerCase().trim()}|${row['Date of Service']}`;
  
      // Assign Paid from queue if available, otherwise mark as "Not Found"
      if (paidQueueMap.has(key) && paidQueueMap.get(key).length > 0) {
        row['Paid'] = paidQueueMap.get(key).shift() // Take first available Paid value
        matchedKeys.add(key); // Mark as matched
      } else {
        row['Paid'] = 'Was not found in Billing!';
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

  

 

 