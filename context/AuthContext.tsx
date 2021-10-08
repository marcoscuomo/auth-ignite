import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
import { useRouter } from 'next/router';
import { setCookie, parseCookies } from 'nookies';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignCredentials): Promise<void>;
  isAuthenticated: boolean;
  user: User | undefined;
}

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {

  const [user, setUser] = useState<User>();
  const router = useRouter();

  /**
   * UseEffect para carregar o acessos e permissões do usuário toda vez que o usuário entrar na aplicação
   * 
   * **/

  useEffect(() => {
    
    //Irá retornar todos os cookies, vamos desestruturar para pegar o token da aplicação.s
    const { 'nextauth.token': token } = parseCookies();

    if(token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      })
    }
  },[]);

  const isAuthenticated = !!user;

  async function signIn({email, password}: SignCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password
      });

      const { token, refreshToken, permissions, roles }: any = response.data;

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/' // Quais caminhos da aplicação terão acesso ao cookie. Com / Todos os caminhos terão acesso.
      });

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/' // Quais caminhos da aplicação terão acesso ao cookie. Com / Todos os caminhos terão acesso.
      });

      setUser({
        email,
        permissions,
        roles
      });

      api.defaults.headers!['Authorization'] = `Bearer ${token}`;

      router.push('/dashboard');
    } catch(err) {
      
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}