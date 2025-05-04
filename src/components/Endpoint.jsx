const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backendchechclass.netlify.app/';

const Endpoint = {
  app: {
    getStatus: `${BASE_URL}/`,
  },

  users: {
    register: `${BASE_URL}/users/register`,
    login: `${BASE_URL}/users/login`,
    updateRole: (id) => `${BASE_URL}/users/${id}/role`,
    updateUser: (id) => `${BASE_URL}/users/${id}`,
    getStudents: `${BASE_URL}/users/students`,
    getTeachers: `${BASE_URL}/users/teachers`,
  },

  attendance: {
    create: `${BASE_URL}/attendance`,
    getAll: `${BASE_URL}/attendance`,
    getByStudent: (studentId) => `${BASE_URL}/attendance/student/${studentId}`,
    getByClass: (classId) => `${BASE_URL}/attendance/class/${classId}`,
  },

  classes: {
    getAll: `${BASE_URL}/classes`,
    create: `${BASE_URL}/classes`,
  },

  qr: {
    generate: `${BASE_URL}/qr/generate`,
    listAll: `${BASE_URL}/qr/list`,
  },
};

export default Endpoint;