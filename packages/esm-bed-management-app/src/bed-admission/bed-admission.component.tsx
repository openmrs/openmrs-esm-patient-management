import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ActivePatientsHome from "./active-patients";

const BedAdmission: React.FC = () => {
  return (
    <BrowserRouter basename={window.getOpenmrsSpaBase()}>
      <Routes>
        <Route path="/home/bed-admission" element={<ActivePatientsHome />} />
      </Routes>
    </BrowserRouter>
  );
};

export default BedAdmission;
