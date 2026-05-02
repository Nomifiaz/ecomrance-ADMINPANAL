import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'admin-dashboard-secret-key';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// Mock Data - Initialized with provided samples
let categories = [
  { id: 1, name: "Clothes", isDeleted: false, createdAt: "2025-09-17T09:10:16.000Z", updatedAt: "2025-09-17T09:10:16.000Z" },
  { id: 2, name: "Bed Sheets", isDeleted: false, createdAt: "2025-09-17T09:24:12.000Z", updatedAt: "2025-09-17T09:24:12.000Z" }
];

let products: any[] = [
  {
    id: 1,
    name: "Maria.B Pakistani Luxury Embroidered Lawn Suit",
    description: "Fabric:Printed Lawn .Work: Embroidery and Printed .Includes: Kameez, Trouser and Dupatta.Accessories: Tassels and hanging pearls will be provided same as the model picture.",
    price: 5679,
    stock: 34,
    images: ["/uploads/1758100603435-WhatsApp Image 2025-09-17 at 2.14.56 PM (1).jpeg"],
    categoryId: 1,
    discountType: "percentage",
    discountValue: 10,
    finalPrice: 5111.1,
    createdAt: "2025-09-17T09:16:43.000Z",
    updatedAt: "2025-09-17T09:16:43.000Z",
    Category: { id: 1, name: "Clothes", isDeleted: false },
    averageRating: "0.0",
    totalRatings: 0,
    rating: 0,
    rating_count: 0
  },
  {
    id: 2,
    name: "Maria.B Pakistani Luxury Embroidered Lawn Suit",
    description: "Fabric:Printed Lawn .Work: Embroidery and Printed .Includes: Kameez, Trouser and Dupatta.Accessories: Tassels and hanging pearls will be provided same as the model picture.",
    price: 10000,
    stock: 34,
    images: ["/uploads/1758100854974-WhatsApp Image 2025-09-17 at 2.20.24 PM.jpeg"],
    categoryId: 1,
    discountType: "percentage",
    discountValue: 50,
    finalPrice: 5000,
    createdAt: "2025-09-17T09:20:55.000Z",
    updatedAt: "2025-09-17T09:20:55.000Z",
    Category: { id: 1, name: "Clothes", isDeleted: false },
    averageRating: "0.0",
    totalRatings: 0,
    rating: 0,
    rating_count: 0
  },
  {
    id: 3,
    name: "SLIME Comforter Set- 7 Pcs",
    description: "1 x Bed Sheet 90 x 95 Inches1 x Comforter Filled (150 GSM) 90 x 95 Inches4 x Pillow Covers Printed 18 x 28 Inches1 x Cushion Cover Printed 16 x 16 Inches",
    price: 7000,
    stock: 34,
    images: ["/uploads/1758101066009-WhatsApp Image 2025-09-17 at 2.20.24 PM.jpeg"],
    categoryId: 2,
    discountType: "percentage",
    discountValue: 30,
    finalPrice: 4900,
    createdAt: "2025-09-17T09:24:26.000Z",
    updatedAt: "2025-09-17T09:27:04.000Z",
    Category: { id: 2, name: "Bed Sheets", isDeleted: false },
    averageRating: "0.0",
    totalRatings: 0,
    rating: 0,
    rating_count: 0
  }
];

let orders: any[] = [
  {
    id: 1,
    userId: 11,
    status: "pending",
    totalAmount: "20640.00",
    shippingAddress: "power market G10/4 islambad",
    city: "islamabad",
    phoneNumber: "03498282340",
    orderDate: "2026-05-01T18:24:29.000Z",
    createdAt: "2026-05-01T18:24:29.000Z",
    updatedAt: "2026-05-01T18:24:29.000Z",
    User: {
      id: 11,
      name: " fiaz",
      email: "numanfia1@gmail.com"
    },
    OrderItems: [
      {
        productName: "tesjjj",
        quantity: 1,
        price: "20640.00",
        total: "20640.00",
        Product: {
          images: ["/uploads/images-1777651786226-537739729.png"]
        }
      }
    ]
  }
];

// Helper for JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Simplified admin login for demo
  if (email === 'admin@gmail.com' && password === 'admin123') {
    const user = { id: 1, name: 'Admin', email, role: 'admin' };
    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '24h' });
    return res.json({ success: true, message: 'Login successful', token, user });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Categories API
app.get('/api/categories', (req, res) => {
  res.json(categories.filter(c => !c.isDeleted));
});

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  const newCat = {
    id: categories.length + 1,
    name,
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  categories.push(newCat);
  res.json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const cat = categories.find(c => c.id === parseInt(id));
  if (cat) {
    cat.name = name;
    cat.updatedAt = new Date().toISOString();
    return res.json(cat);
  }
  res.status(404).json({ error: 'Category not found' });
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const cat = categories.find(c => c.id === parseInt(id));
  if (cat) {
    cat.isDeleted = true;
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Category not found' });
});

// Products API
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', upload.array('images'), (req, res) => {
  const { name, description, price, stock, categoryId, discountType, discountValue } = req.body;
  const files = req.files as Express.Multer.File[];
  const images = files ? files.map(f => `/uploads/${f.filename}`) : [];
  
  const p = parseFloat(price);
  const dv = parseFloat(discountValue);
  const finalPrice = discountType === 'percentage' ? p * (1 - dv / 100) : p - dv;

  const newProduct = {
    id: products.length + 1,
    name,
    description,
    price: p,
    stock: parseInt(stock),
    images,
    categoryId: parseInt(categoryId),
    discountType,
    discountValue: dv,
    finalPrice,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    Category: categories.find(c => c.id === parseInt(categoryId)),
  };
  products.push(newProduct);
  res.json(newProduct);
});

app.put('/api/products/:id', upload.array('images'), (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, categoryId, discountType, discountValue } = req.body;
  const files = req.files as Express.Multer.File[];
  
  const index = products.findIndex(p => p.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: 'Product not found' });

  const p = parseFloat(price);
  const dv = parseFloat(discountValue);
  const finalPrice = discountType === 'percentage' ? p * (1 - dv / 100) : p - dv;

  const updatedProduct = {
    ...products[index],
    name: name || products[index].name,
    description: description || products[index].description,
    price: p || products[index].price,
    stock: parseInt(stock) || products[index].stock,
    categoryId: parseInt(categoryId) || products[index].categoryId,
    discountType: discountType || products[index].discountType,
    discountValue: dv || products[index].discountValue,
    finalPrice: finalPrice || products[index].finalPrice,
    updatedAt: new Date().toISOString(),
    images: files && files.length > 0 ? files.map(f => `/uploads/${f.filename}`) : products[index].images,
    Category: categories.find(c => c.id === parseInt(categoryId)) || products[index].Category,
  };

  products[index] = updatedProduct;
  res.json(updatedProduct);
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  products = products.filter(p => p.id !== parseInt(id));
  res.json({ success: true });
});

// Orders API
app.get('/api/allOrder', (req, res) => {
  res.json({ success: true, totalOrders: orders.length, data: orders });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.id === parseInt(id));
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return res.json({ success: true, data: order });
  }
  res.status(404).json({ success: false, message: 'Order not found' });
});

// Reports API
app.get('/api/report', (req, res) => {
  const { range } = req.query;
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
  
  res.json({
    success: true,
    reportRange: range,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    summary: {
      totalOrders: orders.length,
      totalRevenue: totalRevenue.toFixed(2),
      averageOrderValue: (totalRevenue / (orders.length || 1)).toFixed(2)
    },
    orders: orders.map(o => ({
      id: o.id,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      status: o.status,
      User: { name: o.User.name }
    }))
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
