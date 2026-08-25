"use client";

import { createContext, useContext } from "react";

export const AdminContext = createContext<{ role: string | null; loading: boolean }>({
  role: null,
  loading: true,
});

export function useAdmin() {
  return useContext(AdminContext);
}
