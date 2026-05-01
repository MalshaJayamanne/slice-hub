import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./context/CartContext";
import ToastProvider from "./components/ToastProvider";

function App() {

  return (
    <ToastProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </ToastProvider>
    
  );
  
}

export default App;
