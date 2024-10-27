import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./Pages/Home";
import Saldo from "./Pages/Saldo";
import Transactions from "./Pages/Transactions";
import Volume from "./Pages/Volume";
import MagicFormula from "./Pages/MagicFormula";
import Sharks from "./Pages/Sharks";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/saldo">Saldo</Link>
            </li>
            <li>
              <Link to="/transactions">Transactions</Link>
            </li>
            <li>
              <Link to="/volume">Volume</Link>
            </li>
            <li>
              <Link to="/magic-formula">Magic Formula</Link>
            </li>
            <li>
              <Link to="/sharks">Sharks</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/saldo" element={<Saldo />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/volume" element={<Volume />} />
          <Route path="/magic-formula" element={<MagicFormula />} />
          <Route path="/sharks" element={<Sharks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
