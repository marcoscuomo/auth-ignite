import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import decode from 'jwt-decode';

import { AuthTokenError } from "../errors/AuthTokenError";
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  /** Função que só permitira o acesso de visitantes não autenticados **/

  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    
    /** withSSRGuest retorna uma função porque o getServerSideProps espera uma função **/
    
    /** Acessar todos os cookies da aplicacao **/
    // ctx.req.cookies
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token'];
  
    if(!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if(options) {
      const user = decode<{ permissions: string[], roles: string[] }>(token);
      const { roles, permissions } = options;
      const userHasValidPermissions = validateUserPermissions({ user, permissions, roles });

      if(!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
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