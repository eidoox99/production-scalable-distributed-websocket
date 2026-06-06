import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import Prices from "./pages/Prices";
import Positions from "./pages/Positions";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/prices">prices</Link> | <Link to="/positions">positions</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/prices" replace />} />
        <Route path="/prices" element={<Prices />} />
        <Route path="/positions" element={<Positions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
