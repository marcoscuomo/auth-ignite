import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

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

    return await fn(ctx);
  }
}