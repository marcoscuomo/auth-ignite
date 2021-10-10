import type { GetServerSideProps } from 'next'
import { FormEvent, useContext, useState } from 'react'
import { parseCookies } from 'nookies';

import { AuthContext } from '../context/AuthContext'
import styles from '../styles/Home.module.css'
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {

  const [email, setEmail] = useState('diego@rocketseat.team');
  const [password, setPassword] = useState('');

  const { isAuthenticated, signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    
    event.preventDefault();
    
    const data = {
      email,
      password
    }

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

      <button type="submit">OK</button>  
    </form>
  )
}


export const getServerSideProps = withSSRGuest(async (ctx) => {

  /** Acessar todos os cookies da aplicacao **/
  // ctx.req.cookies
  // const cookies = parseCookies(ctx);

  /** Enviado para a função withSSRGuest **/
  // if(cookies['nextauth.token']) {
  //   return {
  //     redirect: {
  //       destination: '/dashboard',
  //       permanent: false
  //     }
  //   }
  // }

  return {
    props: {}
  }

});