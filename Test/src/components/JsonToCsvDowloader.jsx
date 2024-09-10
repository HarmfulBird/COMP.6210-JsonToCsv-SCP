import React, { useState } from 'react';

// Helper function to convert JSON to CSV
const jsonToCsv = (jsonData, numItems) => {
  // Define the fields to include in the CSV
  const fields = ['Name', 'Class', 'Containment', 'Description'];
  const csvRows = [];

  // Add the header row
  csvRows.push(fields.join(','));

  // Function to extract data from HTML content
  const extractDataFromHtml = (html) => {
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract relevant data using query selectors
    const objectClassElement = Array.from(doc.querySelectorAll('p')).find(p => p.innerText.includes('Object Class:'));
    const containmentElement = Array.from(doc.querySelectorAll('p')).find(p => p.innerText.includes('Special Containment Procedures:'));
    const descriptionElement = Array.from(doc.querySelectorAll('p')).find(p => p.innerText.includes('Description:'));

    const objectClass = objectClassElement ? objectClassElement.innerText.split('Object Class:')[1].split('\n')[0].trim() : '';
    const containment = containmentElement ? containmentElement.innerText.split('Special Containment Procedures:')[1].split('\n')[0].trim() : '';
    const description = descriptionElement ? descriptionElement.innerText.split('Description:')[1].split('\n')[0].trim() : '';

    return {
      class: objectClass,
      containment,
      description,
    };
  };

  // Randomly select a subset of SCPs
  const selectRandomItems = (data, numItems) => {
    const keys = Object.keys(data);
    // Shuffle the keys array and select the first numItems items
    const shuffledKeys = keys.sort(() => 0.5 - Math.random());
    return shuffledKeys.slice(0, numItems);
  };

  const selectedKeys = selectRandomItems(jsonData, numItems);

  // Process each selected item in the JSON data
  selectedKeys.forEach(key => {
    const item = jsonData[key];
    const { class: objectClass, containment, description } = extractDataFromHtml(item.raw_content);
    
    // Add data row to CSV
    csvRows.push([key, objectClass, containment, description].join(','));
  });

  return csvRows.join('\n');
};

// React component
const JsonToCsvDownloader = () => {
  const [loading, setLoading] = useState(false);

  // Fetch JSON data and generate CSV
  const fetchDataAndGenerateCsv = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://scp-data.tedivm.com/data/scp/items/content_series-1.json'); // Replace with your JSON URL
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      // Convert JSON data to CSV (e.g., 20 randomly selected SCPs)
      const csv = jsonToCsv(data, 20);

      // Create a downloadable CSV file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.csv';
      a.click();

      // Clean up URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error fetching or processing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchDataAndGenerateCsv} disabled={loading}>
        {loading ? 'Loading...' : 'Download CSV'}
      </button>
    </div>
  );
};

export default JsonToCsvDownloader;

