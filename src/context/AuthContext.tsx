import React from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

type Decoded = {
  exp: number;
  user_id?: number;
  username?: string;
  email?: string;
  [k: string]: unknown;
};

type AuthState = {
  access: string | null;
  refresh: string | null;
  user: Decoded | null;
};

const AuthContext = React.createContext({
  isAuthenticated: false,
  user: null as Decoded | null,
  loadingAuth: true,
  login: async (username: string, password: string) => {},
  logout: () => {},
  getAuthHeader: () => ({} as Record<string, string>),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = React.useState(true);

  const [state, setState] = React.useState<AuthState>(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    const user = access ? safeDecode(access) : null;
    return { access, refresh, user };
  });
  React.useEffect(() => {
    // simulamos carga inicial
    setTimeout(() => setLoading(false), 50);
  }, []);

  const isAuthenticated = !!state.access && !isExpired(state.access);

  // 🔥 INTERCEPTORES GLOBALES
  React.useEffect(() => {
    const reqId = axios.interceptors.request.use((config) => {
      if (state.access && !isExpired(state.access)) {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${state.access}`,
        };
      }
      return config;
    });

    const resId = axios.interceptors.response.use(
      (r) => r,
      async (error) => {
        const original = error.config;
        if (
          error.response?.status === 401 &&
          !original._retry &&
          state.refresh
        ) {
          original._retry = true;
          try {
            const { data } = await axios.post("token/refresh/", {
              refresh: state.refresh,
            });

            const newAccess: string = data.access;
            localStorage.setItem("access", newAccess);
            setState((s) => ({
              ...s,
              access: newAccess,
              user: safeDecode(newAccess),
            }));
            original.headers.Authorization = `Bearer ${newAccess}`;
            return axios(original);
          } catch (e) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, [state.access, state.refresh]);

  // 🔥 LOGIN CORRECTO
  async function login(username: string, password: string) {
    const { data } = await axios.post("token/", { username, password });

    const { access, refresh } = data;

    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    setState({
      access,
      refresh,
      user: safeDecode(access),
    });
  }

  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setState({ access: null, refresh: null, user: null });
  }

  function getAuthHeader() {
    return state.access ? { Authorization: `Bearer ${state.access}` } : {};
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: state.user,
        login,
        logout,
        getAuthHeader,
        loadingAuth: loading, // <-- añadir aquí
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return React.useContext(AuthContext);
}

function isExpired(access: string) {
  try {
    const { exp } = jwtDecode<Decoded>(access);
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function safeDecode(token: string): Decoded | null {
  try {
    return jwtDecode<Decoded>(token);
  } catch {
    return null;
  }
}
