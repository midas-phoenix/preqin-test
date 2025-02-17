import ReactDOM from "react-dom/client";

import "./index.css";
import InvestorsPage from "./components/Investors.Page";
import { Router, Routes, Route, BrowserRouter } from "react-router-dom";
import React from "react";
import InvestorCommitmentsPage from "./components/InvestorCommitments.Page";

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvestorsPage />} />
        <Route path="/investors/:id" element={<InvestorCommitmentsPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);