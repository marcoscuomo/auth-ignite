import axios, { Axios, AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();

/** Será utilizada para criar uma fila de requisições, quando estiver atualizado 
 *   token no RefreshToken as demais requisições vão parar
 * **/
let isRefreshing = false; 

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
});
/** Até aqui o código é executado somente quando o usuário entra na aplicação pela primeira vez **/

/** Daqui baixo será executado a cada resposta da api **/
/**
 * Vai interceptar todas as respostas do servidor para capturar o momento
 *  que o token estiver expiado.
 * O primeiro parametro, response => {...} a resposta recebida é um sucesso. Nesse caso vamos apenas devolver
 * o response para a aplicação
 * O segundo (error: AxiosError)... pega o erro do servidor, 
 * **/
api.interceptors.response.use(response => {
  
  return response;

}, (error) => {
  
  if(error.response?.status === 401) {
    if(error.response.data?.code === 'token.expired') {
      /** Renovar o token **/
      cookies = parseCookies();

      const { 'nextauth.refreshToken': refreshToken } = cookies;

      if(!isRefreshing){

        isRefreshing = true;

        
        api.post('/refresh', {
          refreshToken,
        }).then((response: any) => {
          const token = response.data.token;
  
          setCookie(undefined, 'nextauth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/' // Quais caminhos da aplicação terão acesso ao cookie. Com / Todos os caminhos terão acesso.
          });
    
          setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/' // Quais caminhos da aplicação terão acesso ao cookie. Com / Todos os caminhos terão acesso.
          });
  
          api.defaults.headers!['Authorization'] = `Bearer ${token}`;
  
        })
      }

    } else {
      //Deslogar usuario
    }
  }
  
})