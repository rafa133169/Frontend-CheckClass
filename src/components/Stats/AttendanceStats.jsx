import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AttendanceStats = ({ attendanceData, className }) => {
  const total = attendanceData.length;
  const present = attendanceData.filter(a => a.status === 'Presente').length;
  const absent = attendanceData.filter(a => a.status === 'Ausente').length;
  const late = attendanceData.filter(a => a.status === 'Tardanza').length;
  const justified = attendanceData.filter(a => a.status === 'Justificado').length;

  const doughnutData = {
    labels: ['Presente', 'Ausente', 'Tardanza', 'Justificado'],
    datasets: [
      {
        data: [present, absent, late, justified],
        backgroundColor: [
          '#10B981',
          '#EF4444',
          '#F59E0B',
          '#3B82F6'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Estadísticas de Asistencia {className && `- ${className}`}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="h-64 md:h-80">
            <Doughnut 
              data={doughnutData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }} 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Resumen General</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Presente</span>
                  <span>{present} ({Math.round((present / total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(present / total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tardanza</span>
                  <span>{late} ({Math.round((late / total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${(late / total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Justificado</span>
                  <span>{justified} ({Math.round((justified / total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(justified / total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Ausente</span>
                  <span>{absent} ({Math.round((absent / total) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(absent / total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{total}</p>
              <p className="text-sm text-blue-800">Clases Totales</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{Math.round((present / total) * 100)}%</p>
              <p className="text-sm text-green-800">Asistencia Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;