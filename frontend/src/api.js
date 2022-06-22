import axios from 'axios'

const api = axios.create({ baseURL: 'https://ajurecruit.tk/api/' })

export default api;
export const SOCKET_URL = "wss://ajurecruit.tk/socket";
