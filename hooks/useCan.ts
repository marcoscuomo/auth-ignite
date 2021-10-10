import { useContext } from "react"
import { AuthContext } from "../context/AuthContext";

type UseCansParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions, roles }: UseCansParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if(!AuthContext) {
    return false;
  }

  if(permissions?.length > 0) {
    const hasAllPermissions = permissions.every(permission => {
      return user.permissions.includes(permission);
    });

    if(!hasAllPermissions) {
      return false;
    }
  }

  if(roles?.length > 0) {
    const hasAllRoles = roles.some(role => {
      return user.roles.includes(role);
    });

    if(!hasAllRoles) {
      return false;
    }
  }

  return true;
}