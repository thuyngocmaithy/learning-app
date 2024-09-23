import { api } from '../utils/apiConfig';


export const getAllAccount = async () => {
  try {
    const response = await api.get('/accounts');
    return response;
  } catch (error) {
    throw error;
  }
};


export const createAccount = async (accountData) => {
  try {
    const response = await api.post('/accounts', accountData);
    return response.data;
  } catch (error) {
    console.error('[accountServive - createAccount - error] : ', error);
    throw error;
  }
};

export const deleteAccounts = async (ids) => {
  try {
    const response = await api.delete(`/accounts?ids=${ids}`);
    return response;
  } catch (error) {
    console.error('Delete accounts error:', error);
    throw error;
  }
};

export const getAccountById = async (id) => {
  try {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  } catch (error) {
    console.error('[accountServive - getAccountById - error] : ', error);
    throw error;
  }
};


export const updateAccountById = async (accountId, accountData) => {
  try {
    const response = await api.put(`/accounts/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    console.error('[accountServive - updateAccountById - error] : ', error);
    throw error;
  }
}