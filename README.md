# EastEdge Ecommerce Website

A modern, minimalist ecommerce website built with the MERN stack (MongoDB, Express.js, React.js, Node.js), inspired by the EastEdge design aesthetic.

## Features

- **Modern Design**: Clean, minimalist UI with smooth animations
- **Responsive Layout**: Mobile-first design that works on all devices
- **Product Management**: Full CRUD operations for products
- **User Authentication**: Secure login/register system with JWT
- **Shopping Cart**: Persistent cart with localStorage
- **Order Management**: Complete order processing system
- **Search & Filtering**: Advanced product search and category filtering
- **Admin Panel**: Admin-only product and order management
- **Payment Integration**: Ready for Stripe integration

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Icons** - Icon library
- **CSS3** - Styling with custom design system

## Project Structure

```
ecommerce/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
├── models/                 # MongoDB schemas
├── routes/                 # API endpoints
├── server.js              # Express server
├── package.json           # Backend dependencies
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `config.env` to `.env`
   - Update the following variables:
     ```env
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     STRIPE_SECRET_KEY=your_stripe_secret_key
     NODE_ENV=development
     ```

3. **Start the server**
   ```bash
   npm run server
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

### Development Mode

To run both backend and frontend simultaneously:
```bash
npm run dev
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/myorders` - Get user orders
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/deliver` - Mark order as delivered (Admin)

### Cart
- `GET /api/cart` - Get cart (frontend managed)
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

## Features in Detail

### Homepage
- Hero sections with compelling messaging
- Featured product categories
- New arrivals showcase
- Trending products
- Newsletter signup

### Product Management
- Product grid with filtering
- Product detail pages
- Add to cart functionality
- Quick view options
- Category-based navigation

### User Experience
- Responsive navigation
- Search functionality
- Shopping cart persistence
- User authentication
- Order tracking

### Admin Features
- Product creation and management
- Order status updates
- User management
- Analytics dashboard (can be extended)

## Customization

### Styling
The design system uses CSS custom properties and a consistent color palette:
- Primary: `#1a1a1a` (Dark)
- Secondary: `#f8f8f8` (Light gray)
- Accent: `#666` (Medium gray)
- White: `#ffffff`

### Adding New Features
1. Create new components in `client/src/components/`
2. Add new pages in `client/src/pages/`
3. Create new API routes in `routes/`
4. Add new models in `models/`

## Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Update MongoDB connection string
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `build` folder to platforms like Vercel, Netlify, or AWS S3

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

---

**Note**: This is a development version. For production use, ensure proper security measures, environment variables, and database optimization.



![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/vigneswarnalluri/eastedge?utm_source=oss&utm_medium=github&utm_campaign=vigneswarnalluri%2Feastedge&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
