import Navbar from "@/components/shop/Navbar";
import Footer from "@/components/shop/Footer";
import { CartProvider } from "@/context/CartContext";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
