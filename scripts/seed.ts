import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/robozed";

const ProductSchema = new mongoose.Schema({
  name: String, slug: String, description: String, price: Number,
  category: String, images: [String], stock: Number, featured: Boolean, specs: Object,
}, { timestamps: true });

const AdminSchema = new mongoose.Schema({
  email: String, password: String, name: String, approved: Boolean,
}, { timestamps: true });

const Product = mongoose.models.Product ?? mongoose.model("Product", ProductSchema);
const Admin = mongoose.models.Admin ?? mongoose.model("Admin", AdminSchema);

const PRODUCTS = [
  {
    name: "Arduino Mega 2560 R3",
    slug: "arduino-mega-2560-r3",
    description: "The ATmega2560-based microcontroller board with 54 digital I/O pins, 16 analog inputs, 4 UARTs, and 256KB flash memory. Perfect for complex robotics and automation projects.",
    price: 1850,
    category: "microchips",
    images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"],
    stock: 50,
    featured: true,
    specs: { "Microcontroller": "ATmega2560", "Clock Speed": "16 MHz", "Flash Memory": "256 KB", "Digital I/O": "54", "Analog Inputs": "16" },
  },
  {
    name: "Raspberry Pi 5 (4GB)",
    slug: "raspberry-pi-5-4gb",
    description: "The latest Raspberry Pi with a 2.4GHz quad-core 64-bit Arm Cortex-A76 processor, 4GB LPDDR4X RAM, PCIe 2.0 interface, and dual 4K display support.",
    price: 8500,
    category: "microchips",
    images: ["https://images.unsplash.com/photo-1580595999172-787970a962d9?w=800&q=80"],
    stock: 25,
    featured: true,
    specs: { "CPU": "Cortex-A76 Quad-core", "RAM": "4GB LPDDR4X", "USB": "2× USB 3.0, 2× USB 2.0", "GPIO": "40-pin" },
  },
  {
    name: "6-DOF Robotic Arm Kit",
    slug: "6-dof-robotic-arm-kit",
    description: "Full 6-degrees-of-freedom robotic arm kit with servo motors, aluminum alloy frame, and Arduino-compatible controller. Great for learning robot kinematics.",
    price: 12500,
    category: "robotics",
    images: ["https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80"],
    stock: 15,
    featured: true,
    specs: { "DOF": "6", "Payload": "500g", "Reach": "450mm", "Motors": "6× MG996R Servo" },
  },
  {
    name: "HC-SR04 Ultrasonic Sensor (5-pack)",
    slug: "hc-sr04-ultrasonic-5pack",
    description: "Pack of 5 HC-SR04 ultrasonic distance sensors with 2cm–400cm range, 3mm accuracy, and TTL logic-level output. Essential for obstacle avoidance robots.",
    price: 450,
    category: "sensors",
    images: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"],
    stock: 200,
    featured: false,
    specs: { "Range": "2cm – 400cm", "Accuracy": "3mm", "Trigger Input": "10μs TTL pulse", "Supply": "5V DC" },
  },
  {
    name: "ESP32 Dev Board",
    slug: "esp32-dev-board",
    description: "Dual-core 240MHz Xtensa LX6 MCU with integrated Wi-Fi and Bluetooth 4.2. 4MB flash, 34 GPIOs, and ADC/DAC. Ideal for IoT projects.",
    price: 680,
    category: "microchips",
    images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"],
    stock: 100,
    featured: true,
    specs: { "CPU": "Dual-core 240MHz", "Flash": "4MB", "Wi-Fi": "802.11 b/g/n", "Bluetooth": "4.2 BR/EDR/BLE" },
  },
  {
    name: "Stepper Motor NEMA17 (2-pack)",
    slug: "stepper-motor-nema17-2pack",
    description: "Two NEMA 17 bipolar stepper motors with 1.8° step angle, 44N·cm holding torque, and 4-wire cable. Perfect for 3D printers and CNC machines.",
    price: 1200,
    category: "robotics",
    images: ["https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"],
    stock: 40,
    featured: false,
    specs: { "Step Angle": "1.8°", "Holding Torque": "44N·cm", "Current": "1.5A", "Resistance": "2.4Ω" },
  },
  {
    name: "Smart LED Strip Kit (5m)",
    slug: "smart-led-strip-kit-5m",
    description: "5 meters of addressable WS2812B RGB LEDs with 60 LEDs/m, 5V operation, and individual pixel control via single data pin. Includes power supply and controller.",
    price: 950,
    category: "gadgets",
    images: ["https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=800&q=80"],
    stock: 80,
    featured: true,
    specs: { "Length": "5m", "LEDs/m": "60", "Protocol": "WS2812B", "Voltage": "5V DC" },
  },
  {
    name: "Raspberry Pi Camera Module V3",
    slug: "raspberry-pi-camera-v3",
    description: "12MP Sony IMX708 sensor with autofocus, HDR mode, and 15-pin MIPI CSI-2 interface. Supports 4K30, 1080p60, and 720p120 video modes.",
    price: 3200,
    category: "gadgets",
    images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80"],
    stock: 30,
    featured: false,
    specs: { "Sensor": "Sony IMX708 12MP", "Max Video": "4K30fps", "Interface": "MIPI CSI-2", "Autofocus": "Phase-detect" },
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Products
  await Product.deleteMany({});
  await Product.insertMany(PRODUCTS);
  console.log(`Seeded ${PRODUCTS.length} products`);

  // Admin
  const existingAdmin = await Admin.findOne({ email: "admin@robozed.com" });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash("admin123", 12);
    await Admin.create({ name: "RoboZed Admin", email: "admin@robozed.com", password: hashed, approved: true });
    console.log("Created admin: admin@robozed.com / admin123");
  } else {
    console.log("Admin already exists");
  }

  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch((err) => { console.error(err); process.exit(1); });
