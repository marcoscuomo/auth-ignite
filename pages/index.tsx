import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {

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

export default Home
