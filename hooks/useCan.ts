import { useContext } from "react"
import { AuthContext } from "../context/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCansParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions, roles }: UseCansParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if(!AuthContext) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({ user, permissions, roles });

  return userHasValidPermissions;
}