const express = require('express')
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 5000

// console.log(process.env.DB_URL);

// Middleware Setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://lebaba-full-ecomerce-frontend.vercel.app',
      'http://localhost:5173'
    ];
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  // res.header('Access-Control-Allow-Origin', '*');
  next();
});

// image upload 
const uploadImage = require("./src/utils/uploadImage")


// All Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
const reviewsRoutes = require('./src/reviews/reviews.router');
const orderRoutes = require('./src/orders/orders.route');
const statsRoutes = require('./src/stats/stats.route');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes)
//

main().then(() => console.log('Connected to MongoDB successfully')
).catch(err => console.log(err));


async function main() {
  await mongoose.connect(process.env.DB_URL);

  app.get('/', (req, res) => {
    res.send('Server is Running...!')
  })

}


app.post("/uploadImage", (req, res) => {
  uploadImage(req.body.image)
    .then((url) => res.send(url))
    .catch((err) => res.status(500).send(err));
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
