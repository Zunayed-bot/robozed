import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer style={{ background: "var(--primary-darker)", color: "#fff", marginTop: "auto" }}>
      <div className="container" style={{ padding: "60px 24px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 16 }}>
              <Image src="/logo-icon-white.png" alt="RoboZed" width={52} height={34} style={{ objectFit: "contain" }} />
              <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>RoboZed</span>
            </Link>
            <p style={{ fontSize: 13, color: "var(--accent-mid)", lineHeight: 1.7, maxWidth: 200 }}>
              Premium microchips, robotics components, and smart gadgets for makers, engineers, and innovators.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent-mid)", marginBottom: 16 }}>
              Shop
            </h4>
            {[
              { href: "/products", label: "All Products" },
              { href: "/products?category=microchips", label: "Microchips" },
              { href: "/products?category=robotics", label: "Robotics" },
              { href: "/products?category=gadgets", label: "Gadgets" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 10, transition: "color 0.2s" }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Info */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent-mid)", marginBottom: 16 }}>
              Info
            </h4>
            {[
              { href: "/cart", label: "Your Cart" },
              { href: "/checkout", label: "Checkout" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none", marginBottom: 10 }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent-mid)", marginBottom: 16 }}>
              Contact
            </h4>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Dhaka, Bangladesh</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>faizur.zunayed@gmail.com</p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} RoboZed. All rights reserved.
          </p>
          <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
