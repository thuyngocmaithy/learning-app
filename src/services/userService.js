import { api, thongtindaotao } from '../utils/apiConfig';

export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response;
  } catch (error) {
    console.log('[userService - login - error] : ', error);
    throw error;
  }
};

// export const loginToSGU = async (username, password) => {
//   try {
//     const payload = { username: username, password, grant_type: "password" };
//     const response = await thongtindaotao.post('/auth/login', payload, {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         origin: "https://thongtindaotao.sgu.edu.vn",
//         referer: "https://thongtindaotao.sgu.edu.vn/",
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.log('[userService - loginToSGU - error]:', error);
//     throw error;
//   }
// };