import axios, { Axios, AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../context/AuthContext';
import { AuthTokenError } from '../errors/AuthTokenError';

/** Será utilizada para criar uma fila de requisições, quando estiver atualizado 
 *   token no RefreshToken as demais requisições vão parar
 * **/
let isRefreshing = false;

/** Vai armazenas as requisições que estarão aguardando o processo de refresh token **/
let failedRequestsQueue: any = [];


/** Refatoramos e deixamos todo o codigo dentro da funcao setupAPIClient para que os metodos 
 * getServerSide tenham acesso a essa função
 *  **/
export function setupAPIClient(ctx = undefined) {
  
  let cookies = parseCookies(ctx);

  const api = axios.create({
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
        cookies = parseCookies(ctx);
  
        const { 'nextauth.refreshToken': refreshToken } = cookies;
        
        /** Toda a configuração de requisição feita a api **/
        const originalConfig = error.config;
        
        if(!isRefreshing) {
  
          isRefreshing = true;
          
          api.post('/refresh', {
            refreshToken,
          }).then((response: any) => {
            const token = response.data.token;
    
            setCookie(ctx, 'nextauth.token', token, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/' // Quais caminhos da aplicação terão acesso ao cookie. Com / Todos os caminhos terão acesso.
            });
      
            setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
              maxAge: 60 * 60 * 24 * 30, // 30 days
              path: '/' // Quais caminhos da aplicação terão acesso ao cookie. Com / Todos os caminhos terão acesso.
            });
    
            api.defaults.headers!['Authorization'] = `Bearer ${token}`;
  
            /** Executa as requisições que estão aguardando **/
            failedRequestsQueue.forEach((request: any) => request.onSuccess(token));
            failedRequestsQueue = [];
    
          }).catch(err => {
            failedRequestsQueue.forEach((request: any) => request.onFailure(err));
            failedRequestsQueue = [];
  
            /** Vamos verificar se estamos executando no client side e não nos metodos serverSide
             *  para evitar erros.
              **/
            if(process.browser) {
              signOut();
            }
  
          }).finally(() => {
            isRefreshing = false;
          })
  
          //Tratar a fila das requisições que vão aguardar o refresh do token
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers['Authorization'] = `Bearer ${token}`
  
                resolve(api(originalConfig))
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              }
            })
          })
        }
  
      } else {
        //Deslogar usuario
        /** Verifica se o processo está sendo executado pelo navegador ou pelo server side **/
        if(process.browser) {
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }
    }
  
    return Promise.reject(error);
    
  });

  return api;
}