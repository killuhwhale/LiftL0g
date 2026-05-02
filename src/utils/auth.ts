// Manage state of current user

import { BASEURL } from "./constants";
import { post } from "./fetchAPI";

// import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { UserProps } from "@/app/types";
import { clearToken, storeToken } from "./tokenUtils";

// The interface for the functions to be given, take no arguments and returns nothing
interface OnLogoutProps {
  (): void;
}
interface OnLoginProps {
  (success: boolean, msg: string): void;
}

class AuthManager {
  onLogout: OnLogoutProps[];
  onLogin: Map<string, OnLoginProps>;

  constructor() {
    this.onLogout = [];
    this.onLogin = new Map(); // Avoids multiple functions from same place.
  }

  listenLogout(fn: OnLogoutProps) {
    this.onLogout.push(fn);
  }

  listenLogin(fn: OnLoginProps, key: string) {
    this.onLogin.set(key, fn);
  }

  async register(data) {
    console.log("Create data type for this data: ", data);
    // Perform login, update tokens access and fresh tokens
    try {
      const res = await post(`${BASEURL}/users/`, data, "multipart/form-data");
      console.log("Register res: ", res);

      if (res.status != 201) {
        switch (res.status) {
          case 400:
            return { email: "Email taken", id: -1, username: "" } as UserProps;
          default:
            return { email: "", id: -1, username: "" } as UserProps;
        }
      }

      const result = await res.json();
      console.log("Register res json: ", result);
      return result as UserProps;
    } catch (err) {
      console.log("Register error: ", err);
      return { email: "", id: -1, username: "" } as UserProps;
    }
  }

  async login(email: string, password: string) {
    // Perform login, update tokens access and fresh tokens
    try {
      // console.error(": ", email);
      const res = await post(`${BASEURL}/token/`, { email: email, password });
      const result = await res.json();
      console.log("Login res: ", result);
      // WHen user is_active=False or bad password
      // {"detail": "No active account found with the given credentials"}

      let loggedIn = false;
      let msg = "";
      if (result.refresh && result.access) {
        if (
          (await storeToken(result.access)) &&
          (await storeToken(result.refresh, false))
        ) {
          loggedIn = true;
        } else {
          msg = "Failed to store token.";
        }
      } else if (
        result.detail == "No active account found with the given credentials"
      ) {
        msg = "No active account found with the given credentials";
      } else {
        msg = "Failed to login";
      }

      [...this.onLogin.keys()].forEach((key) => {
        console.log("calling this on login@");
        const fn = this.onLogin.get(key);
        if (fn) {
          fn(loggedIn, msg);
        }
      });
      // Only call this on successful login.
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  }

  async logout() {
    console.log("Loggin out");
    if (await clearToken()) {
      this.onLogout.forEach((fn) => fn());
    }
  }

  async refreshToken(): Promise<boolean> {
    // Get refresh token and refresh the access token
    const res = await fetch(`${BASEURL}/token/refresh/`);
    console.log("Refresh res", res);
    return true;
  }
}

const auth = new AuthManager();
export default auth;
