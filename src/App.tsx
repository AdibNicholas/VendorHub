import Navbar from "./components/layout/Navbar";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <AppRoutes />
    </div>
  );
}

export default App;