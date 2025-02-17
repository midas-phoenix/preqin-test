
import "./index.css";
import InvestorsPage from "./components/Investors.Page";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import InvestorCommitmentsPage from "./components/InvestorCommitments.Page";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<InvestorsPage />} />
      <Route path="/investors/:id" element={<InvestorCommitmentsPage />} />
    </Routes>
  </BrowserRouter>
);

// const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);

console.log(process.env.REACT_APP_API_URL)

export default App;