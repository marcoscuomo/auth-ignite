import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../errors/AuthTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  /** Função que só permitira o acesso de visitantes não autenticados **/

  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    
    /** withSSRGuest retorna uma função porque o getServerSideProps espera uma função **/
    
    /** Acessar todos os cookies da aplicacao **/
    // ctx.req.cookies
    const cookies = parseCookies(ctx);
  
    if(!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    try {
      // const response = await apiClient.get('/me');
      return await fn(ctx);
    } catch(err) {
      if(err instanceof AuthTokenError) {
        destroyCookie(ctx, 'nextauth.token');
        destroyCookie(ctx, 'nextauth.refreshToken');
    
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }
    }
  }
}