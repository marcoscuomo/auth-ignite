import { destroyCookie } from "nookies";
import { useContext, useEffect } from "react"

import { AuthContext } from "../context/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";
import { Can } from '../components/Can';

export default function Dashboard() {
  
  const { user, signOut } = useContext(AuthContext);

  // const userCanSeeMetrics = useCan({
  //   roles: ['administrator', 'editor']
  //   // permissions: ['metrics.list']
  // });

  useEffect(() => {
    api.get('/me')
    .then(response => console.log('dash', response))
    .catch(err => console.log(err))
  }, []);
  
  return (
    <>
      <h1>Dashboard: {user?.email} </h1>

      {/* { userCanSeeMetrics && <div>Métrics </div> } */}
      <button onClick={signOut}>Signout</button>

      <Can permissions={['metrics.list']}>
        <div>Métrics </div> 
      </Can>  

    </>
  )
}

export const getServerSideProps = withSSRAuth( async(ctx) => {

  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');

  return {
    props: {}
  }
});