// src/layouts/HostLayout.jsx
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useUiMode } from "../stores/useUiMode";

export default function HostLayout() {
  const { enterHost, exitHost } = useUiMode();

  useEffect(() => {
    enterHost();
    return () => exitHost();
  }, [enterHost, exitHost]);

  return <Outlet />;
}
