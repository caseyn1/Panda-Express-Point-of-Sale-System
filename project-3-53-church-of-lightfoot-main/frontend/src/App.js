import "./App.css";
import { PointOfSale } from "./routes/PointOfSale";
import { MenuBoard } from "./routes/MenuBoard";
import { Manager } from "./routes/Manager";
import { KitchenView } from "./routes/KitchenView";

import { KioskStart } from "./routes/KioskRoute/KioskStart";
import { KioskOrder } from "./routes/KioskRoute/KioskOrder";
import { Home } from "./routes/Home";
import { CompletedView } from "./routes/CompletedView";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider, UserContext } from "./context/UserContext";
import { useContext } from "react";
import Login from "./routes/Login";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
          </Route>
          <Route path="/POS" element={<ProtectedRoute role={1} component={PointOfSale} />} />
          <Route path="/MenuBoard" element={<MenuBoard />} />
          <Route path="/manager" element={<ProtectedRoute role={3} component={Manager} />} />
          <Route path="/KioskStart" element={<ProtectedRoute role={0} component={KioskStart} />} />
          <Route path="/KioskOrder" element={<ProtectedRoute role={0} component={KioskOrder} />} />
          <Route path="/KitchenView" element={<ProtectedRoute role={2} component={KitchenView} />} />
          <Route path="/CompletedView" element={<ProtectedRoute role={2} component={CompletedView} />} />
          <Route path="/admin/kioskOrder" element={<KioskOrder />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

// New ProtectedRoute component to handle role-based access
function ProtectedRoute({ role, component: Component }) {
  const { user } = useContext(UserContext);

  // Check if the user has the required role
  const hasAccess = user && user.role >= role;

  return hasAccess ? <Component /> : <Login />;
}

export default App;
