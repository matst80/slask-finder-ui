import React, { PropsWithChildren } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, Link, RouterProvider } from "react-router-dom";
import { Admin } from "./Admin.tsx";
import { Tracking } from "./Tracking.tsx";
import { Navbar } from "./components/NavBar.tsx";
import { SWRConfig } from "swr";
import { getRawData } from "./api.ts";
import { ProductPage } from "./components/ProductPage.tsx";

const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PageContainer>
        <App />
      </PageContainer>
    ),
  },
  {
    path: "admin",
    element: (
      <PageContainer>
        <Admin />
      </PageContainer>
    ),
  },
  {
    path: "product/:id",
    loader: ({ params: { id } }) =>
      id != null ? getRawData(id) : Promise.resolve(null),
    element: (
      <PageContainer>
        <ProductPage />
      </PageContainer>
    ),
  },
  {
    path: "tracking",
    element: (
      <PageContainer>
        <Tracking />
      </PageContainer>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SWRConfig value={{}}>
      <RouterProvider router={router} />
    </SWRConfig>
  </React.StrictMode>
);
