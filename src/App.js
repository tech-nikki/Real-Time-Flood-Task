import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import moment from 'moment'
import 'chartjs-adapter-moment'
import './App.css';

function App() {
  const [stations, setStations] = useState([]);

  const [selectedStation, setSelectedStation] = useState('');
  const [chart, setChart] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (selectedStation !== '') {
      fetchData();
    } else {
      if (chart) {
        chart.destroy();
      }

    }

    console.log(selectedStation)
  }, [selectedStation]);

  const fetchStations = () => {

    fetch('https://environment.data.gov.uk/flood-monitoring/id/stations?_limit=50')
      .then(response => response.json())
      .then(data => {
        setStations(data.items);
      })
      .catch(error => console.error('Error fetching stations:', error));
  };

  const fetchData = () => {

    fetch(`https://environment.data.gov.uk/flood-monitoring/id/stations/${selectedStation}/readings?_sorted&_limit=100`)
      .then(response => response.json())
      .then(data => {
        updateChart(data.items);

      })
      .catch(error => console.error('Error fetching data:', error));
  };

  const updateChart = data => {
    if (chart) {
      chart.destroy();
    }

    const ctx = document.getElementById('chartData').getContext('2d');
    const formattedData = {
      labels: data.map(value => new Date(value.dateTime)),
      waterLevels: data.map(value => (value.value)),
    };
    console.log(formattedData)

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: formattedData.labels,
        datasets: [{
          label: 'Water Level',
          data: formattedData.waterLevels,
          borderColor: 'blue',
          fill: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Water Level',
            },
          },
        },
      },
    });

    setChart(newChart);
  };


  return (
    <div className="App">
      <h1>Flood Monitoring Tool</h1>

      <label htmlFor="stationSelect">Select a Measurement Station:</label>
      <select id="stationSelect" onChange={e => setSelectedStation(e.target.value)}>
        <option value="">Select a station</option>
        {stations.map(station => (
          <option key={station.stationReference} value={station.stationReference}>
            {station.catchmentName}
          </option>
        ))}
      </select>

      <div id="chartContainer">
        <canvas id="chartData"></canvas>
      </div>

      {!selectedStation.length ?
        <div className="table-container">
          <h2>Station Details</h2>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Catchment Name</th>
                <th>Date Opened</th>
                <th>Label</th>
                <th>Latitude </th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{station.catchmentName}</td>
                  <td>{station.dateOpened ? moment(moment(station.dateOpened, 'YYYY-MM-DD')).format('DD-MM-YYYY') : ""}</td>
                  <td>{station.label}</td>
                  <td>{station.lat}</td>
                  <td>{station.long}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        : null}
    </div>
  );
}



export default App;
