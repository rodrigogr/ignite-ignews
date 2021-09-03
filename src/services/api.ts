import axios from 'axios';

export const api = axios.create({
// O Axios já aproveita da aplicação o endereço http://localhost:3000.
    baseURL: '/api' 
})