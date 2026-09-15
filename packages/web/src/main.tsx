import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { router } from "./router";
import { globalStyles } from "./styles/global.stylex";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";

const appRoot = document.getElementById("app")!;
document.documentElement.className = stylex.props(globalStyles.document).className ?? "";
document.body.className = stylex.props(globalStyles.body).className ?? "";
appRoot.className = stylex.props(globalStyles.app).className ?? "";

ReactDOM.createRoot(appRoot).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
