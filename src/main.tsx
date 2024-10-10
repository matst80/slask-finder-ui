import React, { PropsWithChildren } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Admin } from "./Admin.tsx";
import { Tracking } from "./Tracking.tsx";
import { Navbar } from "./components/NavBar.tsx";
import { SWRConfig } from "swr";
import { getRawData, getTrackingSessions } from "./api.ts";
import { ProductPage } from "./components/ProductPage.tsx";
import { SessionView } from "./components/Sessions.tsx";
import { QueriesView } from "./tracking/queries.tsx";

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
    path: "dashboard",
    element: (
      <PageContainer>
        <div></div>
      </PageContainer>
    ),
  },
  {
    path: "edit",
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
    path: "stats",
    element: (
      <PageContainer>
        <Tracking />
      </PageContainer>
    ),
    children: [
      {
        path: "session/:id",
        loader: ({ params: { id } }) =>
          getTrackingSessions().then((d) => {
            console.log(d, id);
            return d.find((s) => String(s.session_id) === id);
          }),
        errorElement: <div>Session not found</div>,
        element: <SessionView />,
      },
      {
        path: "queries",
        element: <QueriesView />,
      },
      {
        path: "popular",
        element: <div>Popular items</div>,
      },
      {
        path: "facets",
        element: <div>Popular facets</div>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SWRConfig value={{}}>
      <RouterProvider router={router} />
    </SWRConfig>
  </React.StrictMode>,
);
