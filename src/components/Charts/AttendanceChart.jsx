import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AttendanceChart = ({ attendanceData }) => {
  // Agrupar por mes
  const monthlyData = attendanceData.reduce((acc, record) => {
    const date = new Date(record.date);
    const month = date.toLocaleString('default', { month: 'short' });
    
    if (!acc[month]) {
      acc[month] = { present: 0, absent: 0, late: 0, justified: 0 };
    }
    
    if (record.status === 'Presente') acc[month].present++;
    else if (record.status === 'Ausente') acc[month].absent++;
    else if (record.status === 'Tardanza') acc[month].late++;
    else if (record.status === 'Justificado') acc[month].justified++;
    
    return acc;
  }, {});

  const months = Object.keys(monthlyData);
  const presentData = months.map(month => monthlyData[month].present);
  const absentData = months.map(month => monthlyData[month].absent);
  const lateData = months.map(month => monthlyData[month].late);
  const justifiedData = months.map(month => monthlyData[month].justified);

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Presente',
        data: presentData,
        backgroundColor: '#10B981',
      },
      {
        label: 'Tardanza',
        data: lateData,
        backgroundColor: '#F59E0B',
      },
      {
        label: 'Justificado',
        data: justifiedData,
        backgroundColor: '#3B82F6',
      },
      {
        label: 'Ausente',
        data: absentData,
        backgroundColor: '#EF4444',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Asistencia por Mes',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default AttendanceChart;