import { setupAPIClient } from "../services/api";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Metrics() {  
  return (
    <>
      <h1>Metrics</h1>
    </>
  )
}

export const getServerSideProps = withSSRAuth( async(ctx) => {

  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');

  /** Vamos pegar pelo payload do jwt as permisões do usuario logado pelo jwt-decode 
   *  pelo withSSRAuth
   * **/


  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
});