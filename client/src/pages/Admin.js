import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBarChart2, FiPackage, FiShoppingCart, FiUsers, FiStar, FiTag, FiFileText, FiSettings, FiLogOut, FiPlus, FiEye, FiEdit, FiTrash2, FiDownload, FiFilter, FiUpload } from 'react-icons/fi';
import api from '../services/api';
import './Admin.css';

const Admin = () => {
  const { logout, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  
     // All hooks must be called before any conditional returns
   const [activeTab, setActiveTab] = useState('dashboard');
   const [selectedStatus, setSelectedStatus] = useState('all');
   const [settingsTab, setSettingsTab] = useState('general');
  
  // Product management state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    salePrice: '',
    category: '',
    subCategory: '',
    stockQuantity: '',
    image: '',
    imagePreview: '',
    images: [],
    sizes: [],
    colors: [],
    variants: [],
    featured: false,
    newArrival: false,
    trending: false
  });
  
  // Orders state
  const [orders, setOrders] = useState([
    {
      id: 'ORD1024',
      customer: 'John Doe',
      date: '2025-06-24',
      amount: 700,
      payment: 'Prepaid',
      status: 'processing',
      delivery: 'processing'
    },
    {
      id: 'ORD1023',
      customer: 'Rohan Sharma',
      date: '2025-06-23',
      amount: 2499,
      payment: 'Prepaid',
      status: 'shipping',
      delivery: 'shipping'
    }
  ]);
  
  // Customers state
  const [customers, setCustomers] = useState([
    {
      id: 'CUST001',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 98765 43210',
      joined: '2025-06-01',
      status: 'shipping'
    },
    {
      id: 'CUST004',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 00000',
      joined: '2025-06-24',
      status: 'processing'
    }
  ]);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    description: '', 
    status: 'active',
    parentCategory: null
  });
  
    // Define fetchData function before using it in useEffect
  const fetchData = async () => {
    try {
      setDataLoading(true);
      console.log('Fetching data from backend...');
      
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/api/products'),
        api.get('/api/categories')
      ]);
      
      console.log('Products response:', productsRes.data);
      console.log('Categories response:', categoriesRes.data);
      
      // Handle API response format - products endpoint returns { products: [...], pagination: {...} }
      const productsData = productsRes.data.products ? productsRes.data.products : 
                         (Array.isArray(productsRes.data) ? productsRes.data : []);
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      
      setProducts(productsData);
      setCategories(categoriesData);
      
      console.log('Data set successfully:', { products: productsData.length, categories: categoriesData.length });
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response?.data);
      // Set empty arrays on error to prevent crashes
      setProducts([]);
      setCategories([]);
    } finally {
      setDataLoading(false);
    }
  };

  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, isAdmin]);
  
  // Show loading while checking auth
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  // Show access denied if not admin
  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

     // Product management functions
   const handleAddProduct = async () => {
     console.log('Attempting to add product:', productForm);
     
           if (!productForm.name || !productForm.sku || !productForm.category || !productForm.price || !productForm.description || !productForm.image) {
        alert('Please fill in all required fields: Name, SKU, Category, Price, Description, and Image URL');
        return;
      }
     
     try {
               // Find the category ID from the selected category name
        const selectedCategory = categories.find(cat => cat.name === productForm.category);
        if (!selectedCategory) {
          alert('Selected category not found. Please try again.');
          return;
        }

        // Process colors to match schema requirements
        const processedColors = productForm.colors.length > 0 
          ? productForm.colors.map(color => typeof color === 'string' ? { name: color, hexCode: '#000000', inStock: true } : color)
          : [{ name: 'Default', hexCode: '#000000', inStock: true }];

        // Process variants to ensure proper format
        const processedVariants = productForm.variants.length > 0 
          ? productForm.variants.map(variant => ({
              size: variant.size || '',
              color: variant.color || '',
              price: parseFloat(variant.price) || 0,
              stock: parseInt(variant.stock) || 0,
              sku: variant.sku || ''
            }))
          : [];

        const productData = {
          name: productForm.name,
          sku: productForm.sku,
          description: productForm.description,
          price: parseFloat(productForm.price),
          salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
          category: selectedCategory._id, // Send category ID
          categoryName: productForm.category, // Send category name
          subCategory: productForm.subCategory || null,
          image: productForm.image,
          images: productForm.images,
          stockQuantity: parseInt(productForm.stockQuantity) || 0,
          sizes: productForm.sizes.length > 0 ? productForm.sizes : ['One Size'],
          colors: processedColors,
          variants: processedVariants,
          featured: productForm.featured,
          newArrival: productForm.newArrival,
          trending: productForm.trending
        };

       console.log('Original colors from form:', productForm.colors);
       console.log('Processed colors for backend:', processedColors);
       console.log('Sending product data to backend:', productData);

       const response = await api.post('/api/products', productData);
       console.log('Product added successfully:', response.data);
       
       setProducts([...products, response.data]);
       setProductForm({
         name: '',
         sku: '',
         description: '',
         price: '',
         salePrice: '',
         category: '',
         subCategory: '',
         stockQuantity: '',
         image: '',
         imagePreview: '',
         images: [],
         sizes: [],
         colors: [],
         variants: [],
         featured: false,
         newArrival: false,
         trending: false
       });
       setShowAddProduct(false);
       
               // Refresh the products list
        fetchData();
        
        // Also refresh all frontend pages if they're open
        if (window.refreshProducts) {
          window.refreshProducts();
        }
        if (window.refreshNewArrivals) {
          window.refreshNewArrivals();
        }
        if (window.refreshHomeProducts) {
          window.refreshHomeProducts();
        }
        
        alert('Product added successfully!');
     } catch (error) {
       console.error('Error adding product:', error);
       console.error('Error response:', error.response?.data);
       alert(`Error adding product: ${error.response?.data?.message || error.message}`);
     }
   };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku || '',
      description: product.description || '',
      price: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : '',
      category: product.categoryName || '',
      subCategory: product.subCategory || '',
      stockQuantity: product.stockQuantity.toString(),
      image: product.image || '',
      imagePreview: product.image || '',
      images: product.images || [],
      sizes: product.sizes || [],
      colors: product.colors ? product.colors.map(color => typeof color === 'string' ? color : color.name) : [],
      variants: product.variants || [],
      featured: product.featured || false,
      newArrival: product.newArrival || false,
      trending: product.trending || false
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = async () => {
            if (editingProduct && productForm.name && productForm.sku && productForm.category && productForm.price) {
      try {
        // Find the category ID from the selected category name
        const selectedCategory = categories.find(cat => cat.name === productForm.category);
        if (!selectedCategory) {
          alert('Selected category not found. Please try again.');
          return;
        }

        // Process colors to match schema requirements
        const processedColors = productForm.colors.length > 0 
          ? productForm.colors.map(color => typeof color === 'string' ? { name: color, hexCode: '#000000', inStock: true } : color)
          : [{ name: 'Default', hexCode: '#000000', inStock: true }];

        // Process variants to ensure proper format
        const processedVariants = productForm.variants.length > 0 
          ? productForm.variants.map(variant => ({
              size: variant.size || '',
              color: variant.color || '',
              price: parseFloat(variant.price) || 0,
              stock: parseInt(variant.stock) || 0,
              sku: variant.sku || ''
            }))
          : [];

        const productData = {
          name: productForm.name,
          sku: productForm.sku,
          description: productForm.description,
          price: parseFloat(productForm.price),
          salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
          category: selectedCategory._id, // Send category ID
          categoryName: productForm.category, // Send category name
          subCategory: productForm.subCategory || null,
          image: productForm.image,
          images: productForm.images,
          stockQuantity: parseInt(productForm.stockQuantity) || 0,
          sizes: productForm.sizes.length > 0 ? productForm.sizes : ['One Size'],
          colors: processedColors,
          variants: processedVariants,
          featured: productForm.featured,
          newArrival: productForm.newArrival,
          trending: productForm.trending
        };

        console.log('Original colors from form:', productForm.colors);
        console.log('Processed colors for backend:', processedColors);

        const response = await api.put(`/api/products/${editingProduct._id}`, productData);
        setProducts(products.map(p => p._id === editingProduct._id ? response.data : p));
        
        // Also refresh all frontend pages if they're open
        if (window.refreshProducts) {
          window.refreshProducts();
        }
        if (window.refreshNewArrivals) {
          window.refreshNewArrivals();
        }
        if (window.refreshHomeProducts) {
          window.refreshHomeProducts();
        }
        
        setEditingProduct(null);
        setProductForm({
          name: '',
          sku: '',
          description: '',
          price: '',
          salePrice: '',
          category: '',
          subCategory: '',
          stockQuantity: '',
          image: '',
          imagePreview: '',
          images: [],
          sizes: [],
          colors: [],
          variants: [],
          featured: false,
          newArrival: false,
          trending: false
        });
        setShowAddProduct(false);
      } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product. Please try again.');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${productId}`);
        setProducts(products.filter(p => p._id !== productId));
        
        // Also refresh all frontend pages if they're open
        if (window.refreshProducts) {
          window.refreshProducts();
        }
        if (window.refreshNewArrivals) {
          window.refreshNewArrivals();
        }
        if (window.refreshHomeProducts) {
          window.refreshHomeProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, delivery: newStatus }
        : order
    ));
  };

  const handleCustomerBlock = (customerId) => {
    setCustomers(customers.map(customer => 
      customer.id === customerId 
        ? { ...customer, status: customer.status === 'blocked' ? 'active' : 'blocked' }
        : customer
    ));
  };

  // Category management functions
  const handleAddCategory = async () => {
    if (categoryForm.name.trim()) {
      try {
        const categoryData = {
          name: categoryForm.name.trim(),
          description: `Category for ${categoryForm.name.trim()}`,
          isActive: categoryForm.status === 'active',
          slug: categoryForm.name.trim().toLowerCase().replace(/\s+/g, '-')
        };

        if (categoryForm.parentCategory) {
          categoryData.parentCategory = categoryForm.parentCategory;
        }

        const response = await api.post('/api/categories', categoryData);
        setCategories([...categories, response.data]);
        setCategoryForm({ name: '', description: '', status: 'active', parentCategory: null });
        setShowAddCategory(false);
      } catch (error) {
        console.error('Error adding category:', error);
        alert('Error adding category. Please try again.');
      }
    }
  };

  // Function to create sample sub-categories
  const createSampleSubCategories = async () => {
    try {
      const sampleSubCategories = [
        // Apparel sub-categories
        { name: 'T-Shirts', parentCategory: 'Apparel', description: 'Casual and formal t-shirts' },
        { name: 'Hoodies', parentCategory: 'Apparel', description: 'Comfortable hooded sweatshirts' },
        { name: 'Jeans', parentCategory: 'Apparel', description: 'Classic denim jeans' },
        { name: 'Shirts', parentCategory: 'Apparel', description: 'Formal and casual shirts' },
        { name: 'Dresses', parentCategory: 'Apparel', description: 'Elegant dresses for all occasions' },
        
        // Accessories sub-categories
        { name: 'Watches', parentCategory: 'Accessories', description: 'Stylish timepieces' },
        { name: 'Bags', parentCategory: 'Accessories', description: 'Handbags and backpacks' },
        { name: 'Jewelry', parentCategory: 'Accessories', description: 'Necklaces, rings, and earrings' },
        { name: 'Belts', parentCategory: 'Accessories', description: 'Leather and fabric belts' },
        { name: 'Sunglasses', parentCategory: 'Accessories', description: 'Trendy eyewear' },
        
        // Home Goods sub-categories
        { name: 'Kitchen', parentCategory: 'Home Goods', description: 'Kitchen appliances and utensils' },
        { name: 'Bedding', parentCategory: 'Home Goods', description: 'Bed sheets, pillows, and comforters' },
        { name: 'Decor', parentCategory: 'Home Goods', description: 'Home decoration items' },
        { name: 'Furniture', parentCategory: 'Home Goods', description: 'Tables, chairs, and storage' },
        { name: 'Bathroom', parentCategory: 'Home Goods', description: 'Bathroom essentials and accessories' }
      ];

      // Find main categories first
      const mainCategories = categories.filter(cat => !cat.parentCategory);
      
      for (const subCat of sampleSubCategories) {
        const parentCategory = mainCategories.find(cat => cat.name === subCat.parentCategory);
        if (parentCategory) {
          const categoryData = {
            name: subCat.name,
            description: subCat.description,
            isActive: true,
            slug: subCat.name.toLowerCase().replace(/\s+/g, '-'),
            parentCategory: parentCategory._id
          };

          try {
            const response = await api.post('/api/categories', categoryData);
            console.log(`Created sub-category: ${subCat.name}`);
          } catch (error) {
            console.error(`Error creating sub-category ${subCat.name}:`, error);
          }
        }
      }

      // Refresh categories after creating sub-categories
      fetchData();
      alert('Sample sub-categories created successfully!');
    } catch (error) {
      console.error('Error creating sample sub-categories:', error);
      alert('Error creating sample sub-categories. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will affect all products in this category.')) {
      try {
        await api.delete(`/api/categories/${categoryId}`);
        setCategories(categories.filter(cat => cat._id !== categoryId));
        // Also remove products in this category
        setProducts(products.filter(product => {
          const category = categories.find(cat => cat._id === categoryId);
          return category ? product.categoryName !== category.name : true;
        }));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category. Please try again.');
      }
    }
  };

  // Export functions
  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportProducts = () => {
    if (Array.isArray(products) && products.length > 0) {
      exportToCSV(products, 'products');
    } else {
      alert('No products to export');
    }
  };
  const handleExportOrders = () => exportToCSV(orders, 'orders');
  const handleExportCustomers = () => exportToCSV(customers, 'customers');

  // Filter functions
  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    // Add category filtering logic here if needed
    return true;
  }) : [];

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      
             {/* Stats Cards */}
       <div className="stats-grid">
         <div className="stat-card">
           <div className="stat-value">₹{orders.reduce((sum, order) => sum + order.amount, 0).toLocaleString()}</div>
           <div className="stat-label">Total Revenue</div>
         </div>
                   <div className="stat-card">
            <div className="stat-value">{Array.isArray(products) ? products.length : 0}</div>
            <div className="stat-label">Total Products</div>
          </div>
         <div className="stat-card">
           <div className="stat-value">{orders.length}</div>
           <div className="stat-label">Total Orders</div>
         </div>
         <div className="stat-card">
           <div className="stat-value">{customers.length}</div>
           <div className="stat-label">Total Customers</div>
         </div>
       </div>

      {/* Charts Placeholder */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>New Orders</h3>
          <div className="chart-placeholder">Chart visualization will be added here</div>
        </div>
        <div className="chart-container">
          <h3>Total Revenue</h3>
          <div className="chart-placeholder">Chart visualization will be added here</div>
        </div>
        <div className="chart-container">
          <h3>Products Sold</h3>
          <div className="chart-placeholder">Chart visualization will be added here</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <button className="export-btn" onClick={handleExportOrders}>
            <FiDownload /> Export Data
          </button>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
                       <tbody>
             {orders.slice(0, 5).map(order => (
               <tr key={order.id}>
                 <td>#{order.id}</td>
                 <td>{order.customer}</td>
                 <td>₹{order.amount}</td>
                 <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
               </tr>
             ))}
           </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Details */}
      <div className="revenue-details">
        <div className="section-header">
          <h3>Revenue Details</h3>
          <div className="date-filter">
            <input type="date" className="date-input" />
            <input type="date" className="date-input" />
            <button className="filter-btn">
              <FiFilter /> Filter
            </button>
            <button className="export-btn" onClick={handleExportOrders}>
              <FiDownload /> Export Data
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Gross Revenue</th>
                <th>Discounts</th>
                <th>Net Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025-06-24</td>
                <td>1</td>
                <td>₹700</td>
                <td>₹0</td>
                <td>₹700</td>
              </tr>
              <tr>
                <td>2025-06-23</td>
                <td>1</td>
                <td>₹2,999</td>
                <td>₹500</td>
                <td>₹2,499</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="top-products">
        <div className="section-header">
          <h3>Top Selling Products</h3>
          <div className="date-filter">
            <input type="date" className="date-input" />
            <input type="date" className="date-input" />
            <button className="filter-btn">
              <FiFilter /> Filter
            </button>
            <button className="export-btn" onClick={handleExportProducts}>
              <FiDownload /> Export Data
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Units Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Classic Black Tee</td>
                <td>EE-TEE-001</td>
                <td>45</td>
                <td>₹35,955</td>
              </tr>
              <tr>
                <td>Minimal White Tee</td>
                <td>EE-TEE-002</td>
                <td>30</td>
                <td>₹23,970</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="admin-products">
      <div className="section-header">
        <h1>Products</h1>
        <div className="header-actions">
          <select className="category-filter">
            <option value="">All Categories</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Hoodies">Hoodies</option>
            <option value="Accessories">Accessories</option>
          </select>
          <button className="add-btn" onClick={() => setShowAddProduct(true)}>
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddProduct && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              <div className="form-group">
                <label>SKU *</label>
                <input
                  type="text"
                  className="form-input"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                  placeholder="Enter SKU (e.g., TSH-001)"
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  className="form-input"
                  value={productForm.category}
                  onChange={(e) => {
                    const selectedCategory = e.target.value;
                    setProductForm({
                      ...productForm, 
                      category: selectedCategory,
                      subCategory: '' // Clear sub-category when main category changes
                    });
                  }}
                >
                  <option value="">Select Category</option>
                  {Array.isArray(categories) ? categories
                    .filter(cat => !cat.parentCategory) // Only show main categories (no parent)
                    .map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    )) : null}
                </select>
              </div>
              <div className="form-group">
                <label>Sub-Category</label>
                <select
                  className="form-input"
                  value={productForm.subCategory}
                  onChange={(e) => setProductForm({...productForm, subCategory: e.target.value})}
                  disabled={!productForm.category} // Disable if no main category selected
                >
                  <option value="">Select Sub-Category (Optional)</option>
                  {Array.isArray(categories) && productForm.category ? categories
                    .filter(cat => {
                      // Find the selected main category
                      const mainCategory = categories.find(mainCat => mainCat.name === productForm.category);
                      // Show only sub-categories that belong to the selected main category
                      return mainCategory && cat.parentCategory && cat.parentCategory.toString() === mainCategory._id.toString();
                    })
                    .map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    )) : null}
                </select>
                <small className="form-help">
                  {!productForm.category 
                    ? 'Select a main category first to see available sub-categories' 
                    : 'Optional: Choose a sub-category for more specific organization'
                  }
                </small>
              </div>
              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  placeholder="Enter price"
                />
              </div>
              <div className="form-group">
                <label>Sale Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={productForm.salePrice}
                  onChange={(e) => setProductForm({...productForm, salePrice: e.target.value})}
                  placeholder="Enter sale price (optional)"
                />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  className="form-input"
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({...productForm, stockQuantity: e.target.value})}
                  placeholder="Enter stock quantity"
                />
              </div>
              <div className="form-group">
                <label>Product Image *</label>
                <input
                  type="file"
                  className="form-input"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      try {
                        // Create FormData for file upload
                        const formData = new FormData();
                        formData.append('image', file);
                        
                        // Upload image to server
                        const uploadResponse = await api.post('/api/upload/image', formData, {
                          headers: {
                            'Content-Type': 'multipart/form-data',
                          },
                        });
                        
                        if (uploadResponse.data.success) {
                          // Store the image path from server response
                          setProductForm({
                            ...productForm, 
                            image: uploadResponse.data.imagePath,
                            imagePreview: uploadResponse.data.imagePath
                          });
                        } else {
                          alert('Failed to upload image');
                        }
                      } catch (error) {
                        console.error('Image upload error:', error);
                        alert('Failed to upload image: ' + error.message);
                      }
                    }
                  }}
                  required
                />
                <small className="form-help">Upload a product image (JPG, PNG, WebP)</small>
                {productForm.imagePreview && (
                  <div className="image-preview">
                    <img 
                      src={productForm.imagePreview} 
                      alt="Preview" 
                      style={{width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px', borderRadius: '4px'}}
                    />
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Additional Images</label>
                <input
                  type="file"
                  className="form-input"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                      try {
                        // Create FormData for multiple file uploads
                        const formData = new FormData();
                        files.forEach(file => {
                          formData.append('images', file);
                        });
                        
                        // Upload images to server
                        const uploadResponse = await api.post('/api/upload/images', formData, {
                          headers: {
                            'Content-Type': 'multipart/form-data',
                          },
                        });
                        
                        if (uploadResponse.data.success) {
                          // Store the image paths from server response
                          setProductForm({
                            ...productForm, 
                            images: [...productForm.images, ...uploadResponse.data.imagePaths]
                          });
                        } else {
                          alert('Failed to upload images');
                        }
                      } catch (error) {
                        console.error('Images upload error:', error);
                        alert('Failed to upload images: ' + error.message);
                      }
                    }
                  }}
                />
                <small className="form-help">Upload additional product images (JPG, PNG, WebP) - Max 5 images</small>
                {productForm.images.length > 0 && (
                  <div className="images-preview">
                    <h4>Additional Images:</h4>
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px'}}>
                      {productForm.images.map((imagePath, index) => (
                        <div key={index} style={{position: 'relative'}}>
                          <img 
                            src={imagePath} 
                            alt={`Product ${index + 1}`} 
                            style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = productForm.images.filter((_, i) => i !== index);
                              setProductForm({...productForm, images: newImages});
                            }}
                            style={{
                              position: 'absolute',
                              top: '-5px',
                              right: '-5px',
                              background: 'red',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  className="form-textarea"
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  placeholder="Enter product description"
                  required
                />
              </div>
            </div>
            
                         <div className="form-group">
               <label>Product Variants</label>
               <div className="variants-section">
                 <div className="variant-inputs">
                   <input
                     type="text"
                     className="form-input"
                     placeholder="Size (e.g., S, M, L, XL)"
                     value={productForm.sizes.join(', ')}
                     onChange={(e) => setProductForm({...productForm, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                   />
                   <input
                     type="text"
                     className="form-input"
                     placeholder="Colors (e.g., Red, Blue, Black)"
                     value={productForm.colors.join(', ')}
                     onChange={(e) => setProductForm({...productForm, colors: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                   />
                 </div>
                 <div className="variants-table">
                   <h4>Variant Combinations</h4>
                   {productForm.sizes.length > 0 && productForm.colors.length > 0 ? (
                     <>
                       <div className="variant-row header">
                         <span>Size</span>
                         <span>Color</span>
                         <span>Price</span>
                         <span>Stock</span>
                         <span>SKU</span>
                       </div>
                       {productForm.sizes.map(size => 
                         productForm.colors.map(color => (
                           <div key={`${size}-${color}`} className="variant-row">
                             <span>{size}</span>
                             <span>{color}</span>
                             <input
                               type="number"
                               className="variant-input"
                               placeholder="Price"
                               value={productForm.variants.find(v => v.size === size && v.color === color)?.price || ''}
                               onChange={(e) => {
                                 const newVariants = [...productForm.variants];
                                 const existingIndex = newVariants.findIndex(v => v.size === size && v.color === color);
                                 if (existingIndex >= 0) {
                                   newVariants[existingIndex].price = e.target.value;
                                 } else {
                                   newVariants.push({
                                     size,
                                     color,
                                     price: e.target.value,
                                     stock: '',
                                     sku: `${productForm.sku}-${size}-${color}`.toUpperCase()
                                   });
                                 }
                                 setProductForm({...productForm, variants: newVariants});
                               }}
                             />
                             <input
                               type="number"
                               className="variant-input"
                               placeholder="Stock"
                               value={productForm.variants.find(v => v.size === size && v.color === color)?.stock || ''}
                               onChange={(e) => {
                                 const newVariants = [...productForm.variants];
                                 const existingIndex = newVariants.findIndex(v => v.size === size && v.color === color);
                                 if (existingIndex >= 0) {
                                   newVariants[existingIndex].stock = e.target.value;
                                 } else {
                                   newVariants.push({
                                     size,
                                     color,
                                     price: productForm.variants.find(v => v.size === size && v.color === color)?.price || '',
                                     stock: e.target.value,
                                     sku: `${productForm.sku}-${size}-${color}`.toUpperCase()
                                   });
                                 }
                                 setProductForm({...productForm, variants: newVariants});
                               }}
                             />
                             <span className="variant-sku">
                               {`${productForm.sku}-${size}-${color}`.toUpperCase()}
                             </span>
                           </div>
                         ))
                       )}
                     </>
                   ) : (
                     <div className="no-variants">
                       <p>Add sizes and colors to see variant combinations</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>

            <div className="form-group">
              <label>Product Features</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                  />
                  Featured Product
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.newArrival}
                    onChange={(e) => setProductForm({...productForm, newArrival: e.target.checked})}
                  />
                  New Arrival
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={productForm.trending}
                    onChange={(e) => setProductForm({...productForm, trending: e.target.checked})}
                  />
                  Trending
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button className="cancel-btn" onClick={() => {
                setShowAddProduct(false);
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  sku: '',
                  description: '',
                  price: '',
                  salePrice: '',
                  category: '',
                  subCategory: '',
                  stockQuantity: '',
                  image: '',
                  imagePreview: '',
                  images: [],
                  sizes: [],
                  colors: [],
                  variants: [],
                  featured: false,
                  newArrival: false,
                  trending: false
                });
              }}>
                Cancel
              </button>
              {editingProduct ? (
                <button className="save-btn" onClick={handleUpdateProduct}>
                  Update Product
                </button>
              ) : (
                <button className="save-btn" onClick={handleAddProduct}>
                  Add Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Sub-Category</th>
              <th>Price</th>
              <th>Sale Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
                     <tbody>
                          {dataLoading ? (
                <tr>
                  <td colSpan="9" className="loading-cell">Loading products...</td>
                </tr>
              ) : !Array.isArray(products) || products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">No products found</td>
                </tr>
              ) : (
                products.map(product => (
                 <tr key={product._id}>
                   <td className="product-cell">
                     <div className="product-info">
                       <div className="product-image">
                         {product.image ? (
                           <img src={product.image} alt={product.name} />
                         ) : (
                           <div className="placeholder-image">P</div>
                         )}
                       </div>
                       <span>{product.name}</span>
                     </div>
                   </td>
                   <td className="sku-cell">{product.sku || 'N/A'}</td>
                   <td>{product.categoryName}</td>
                   <td>{product.subCategory || 'N/A'}</td>
                   <td>₹{product.price}</td>
                   <td>{product.salePrice ? `₹${product.salePrice}` : 'N/A'}</td>
                   <td>{product.stockQuantity}</td>
                   <td>
                     <div className="status-badges">
                       {product.featured && <span className="badge featured">Featured</span>}
                       {product.newArrival && <span className="badge new">New</span>}
                       {product.trending && <span className="badge trending">Trending</span>}
                     </div>
                   </td>
                   <td className="actions">
                     <button className="action-btn view"><FiEye /></button>
                     <button className="action-btn edit" onClick={() => handleEditProduct(product)}><FiEdit /></button>
                     <button className="action-btn delete" onClick={() => handleDeleteProduct(product._id)}><FiTrash2 /></button>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="admin-orders">
      <div className="section-header">
        <h1>Orders Management</h1>
        <div className="header-actions">
          <select 
            className="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
                     <button className="export-btn" onClick={handleExportOrders}>
             <FiDownload /> Export Orders
           </button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
                     <tbody>
             {filteredOrders.map(order => (
               <tr key={order.id}>
                 <td>#{order.id}</td>
                 <td>{order.customer}</td>
                 <td>{order.date}</td>
                 <td>₹{order.amount}</td>
                 <td>{order.payment}</td>
                 <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                 <td>
                   <select 
                     className="status-select"
                     value={order.delivery}
                     onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                   >
                     <option value="new">New Order</option>
                     <option value="processing">Processing</option>
                     <option value="shipping">Shipping</option>
                     <option value="delivered">Delivered</option>
                     <option value="completed">Completed</option>
                     <option value="returned">Returned</option>
                     <option value="cancelled">Cancelled</option>
                   </select>
                 </td>
                 <td className="actions">
                   <button className="action-btn view"><FiEye /></button>
                   <button className="action-btn edit"><FiEdit /></button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button className="page-btn">‹ Prev</button>
        <span className="page-info">1 2</span>
        <button className="page-btn">Next ›</button>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="admin-customers">
      <div className="section-header">
        <h1>Customer Management</h1>
        <div className="header-actions">
          <select className="status-filter">
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Last Delivery Status</th>
              <th>Actions</th>
            </tr>
          </thead>
                     <tbody>
             {customers.map(customer => (
               <tr key={customer.id}>
                 <td>#{customer.id}</td>
                 <td>{customer.name}</td>
                 <td>{customer.email}</td>
                 <td>{customer.phone}</td>
                 <td>{customer.joined}</td>
                 <td><span className={`status-badge ${customer.status}`}>{customer.status}</span></td>
                 <td className="actions">
                   <button className="action-btn view"><FiEye /></button>
                   <button className="action-btn edit"><FiEdit /></button>
                   <button 
                     className="action-btn block" 
                     onClick={() => handleCustomerBlock(customer.id)}
                   >
                     {customer.status === 'blocked' ? 'Unblock' : 'Block'}
                   </button>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button className="page-btn">‹ Prev</button>
        <span className="page-info">1 2</span>
        <button className="page-btn">Next ›</button>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="admin-reviews">
      <div className="section-header">
        <h1>Review Management</h1>
        <div className="header-actions">
          <select className="status-filter">
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Classic Black Tee</td>
              <td>Rohan Sharma</td>
              <td>⭐⭐⭐⭐⭐</td>
              <td>This T-shirt is amazing! Great quality and fit.</td>
              <td><span className="status-badge approved">Approved</span></td>
              <td className="actions">
                <button className="action-btn view"><FiEye /></button>
                <button className="action-btn edit"><FiEdit /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="admin-categories">
      <div className="section-header">
        <h1>Categories</h1>
        <div className="header-actions">
          <button className="add-btn" onClick={createSampleSubCategories}>
            <FiPlus /> Create Sample Sub-Categories
          </button>
          <button className="add-btn" onClick={() => setShowAddCategory(true)}>
            <FiPlus /> Add Category
          </button>
        </div>
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="form-modal">
          <div className="form-content">
            <h3>Add New Category</h3>
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                className="form-input"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="Enter category name"
              />
            </div>
                         <div className="form-group">
               <label>Parent Category</label>
               <select
                 className="form-input"
                 value={categoryForm.parentCategory || ''}
                 onChange={(e) => setCategoryForm({...categoryForm, parentCategory: e.target.value || null})}
               >
                 <option value="">Select Parent Category (Optional)</option>
                 {Array.isArray(categories) ? categories
                   .filter(cat => !cat.parentCategory) // Only show main categories
                   .map(cat => (
                     <option key={cat._id} value={cat._id}>{cat.name}</option>
                   )) : null}
               </select>
             </div>
             <div className="form-group">
               <label>Status</label>
               <select
                 className="form-input"
                 value={categoryForm.status}
                 onChange={(e) => setCategoryForm({...categoryForm, status: e.target.value})}
               >
                 <option value="active">Active</option>
                 <option value="inactive">Inactive</option>
               </select>
             </div>
             <div className="form-group">
               <label>Description</label>
               <textarea
                 className="form-textarea"
                 value={categoryForm.description || ''}
                 onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                 placeholder="Enter category description"
               />
             </div>
            <div className="form-actions">
                             <button className="cancel-btn" onClick={() => {
                 setShowAddCategory(false);
                 setCategoryForm({ name: '', description: '', status: 'active', parentCategory: null });
               }}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleAddCategory}>
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Type</th>
              <th>Sub-Categories</th>
              <th>Product Count</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(categories) ? categories
              .filter(cat => !cat.parentCategory) // Only show main categories in the main table
              .map(mainCategory => {
                const subCategories = categories.filter(cat => 
                  cat.parentCategory && cat.parentCategory.toString() === mainCategory._id.toString()
                );
                const productCount = Array.isArray(products) ? 
                  products.filter(p => p.categoryName === mainCategory.name).length : 0;
                
                return (
                  <React.Fragment key={mainCategory._id}>
                    {/* Main Category Row */}
                    <tr className="main-category-row">
                      <td>
                        <strong>{mainCategory.name}</strong>
                      </td>
                      <td>
                        <span className="category-type main">Main Category</span>
                      </td>
                      <td>
                        {subCategories.length > 0 ? (
                          <span className="sub-category-count">
                            {subCategories.length} sub-category{subCategories.length !== 1 ? 'ies' : ''}
                          </span>
                        ) : (
                          <span className="no-sub-categories">No sub-categories</span>
                        )}
                      </td>
                      <td>{productCount}</td>
                      <td><span className={`status-badge ${mainCategory.isActive ? 'approved' : 'processing'}`}>
                        {mainCategory.isActive ? 'Active' : 'Inactive'}
                      </span></td>
                      <td className="actions">
                        <button className="action-btn edit"><FiEdit /></button>
                        <button className="action-btn delete" onClick={() => handleDeleteCategory(mainCategory._id)}><FiTrash2 /></button>
                      </td>
                    </tr>
                    
                    {/* Sub-Categories Rows */}
                    {subCategories.map(subCategory => {
                      const subProductCount = Array.isArray(products) ? 
                        products.filter(p => p.categoryName === subCategory.name).length : 0;
                      
                      return (
                        <tr key={subCategory._id} className="sub-category-row">
                          <td>
                            <span className="sub-category-indent">└─ {subCategory.name}</span>
                          </td>
                          <td>
                            <span className="category-type sub">Sub-Category</span>
                          </td>
                          <td>
                            <span className="sub-category-info">Child of {mainCategory.name}</span>
                          </td>
                          <td>{subProductCount}</td>
                          <td><span className={`status-badge ${subCategory.isActive ? 'approved' : 'processing'}`}>
                            {mainCategory.isActive ? 'Active' : 'Inactive'}
                          </span></td>
                          <td className="actions">
                            <button className="action-btn edit"><FiEdit /></button>
                            <button className="action-btn delete" onClick={() => handleDeleteCategory(subCategory._id)}><FiTrash2 /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="no-data">No categories found</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDiscounts = () => (
    <div className="admin-discounts">
      <div className="section-header">
        <h1>Discounts</h1>
        <button className="add-btn">
          <FiPlus /> Add Discount
        </button>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Uses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SALE20</td>
              <td>Percentage</td>
              <td>20%</td>
              <td>25/100</td>
              <td className="actions">
                <button className="action-btn edit"><FiEdit /></button>
                <button className="action-btn delete"><FiTrash2 /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContentManager = () => (
    <div className="admin-content">
      <h1>Content Manager</h1>
      
      {/* Top Bar Announcement */}
      <div className="content-section">
        <h3>Top Bar Announcement</h3>
        <div className="form-group">
          <input type="text" placeholder="Announcement Text" className="form-input" />
        </div>
        <div className="form-group">
          <input type="text" placeholder="Call to Action Link (Optional)" className="form-input" />
        </div>
        <button className="save-btn">Save Announcement</button>
      </div>

      {/* Hero Slider */}
      <div className="content-section">
        <h3>Hero Slider</h3>
        <div className="form-group">
          <input type="text" placeholder="Title" className="form-input" />
        </div>
        <div className="form-group">
          <textarea placeholder="Description" className="form-textarea">The wait is over! Our most anticipated collection is finally here.</textarea>
        </div>
        <div className="form-group">
          <input type="text" placeholder="CTA Text" className="form-input" />
        </div>
        <div className="form-group">
          <input type="text" placeholder="CTA Link" className="form-input" />
        </div>
        <div className="form-group">
          <input type="file" className="form-input" />
          <label>Background Image</label>
        </div>
        <div className="form-actions">
          <button className="remove-btn">Remove Slide</button>
          <button className="add-btn"><FiPlus /> Add Slide</button>
          <button className="save-btn">Save Slider Settings</button>
        </div>
      </div>

      {/* Homepage Sections */}
      <div className="content-section">
        <h3>Homepage Sections</h3>
        <p>Manage which categories and products appear on your homepage sections from their respective pages.</p>
        <ul className="section-list">
          <li><strong>Featured Categories:</strong> Go to the Categories page and mark them as "featured".</li>
          <li><strong>New Arrivals:</strong> Go to the Products page and check "Mark as New Arrival".</li>
          <li><strong>Trending Products:</strong> Go to the Products page and check "Mark as Trending".</li>
        </ul>
      </div>

      {/* Promotional Banner */}
      <div className="content-section">
        <h3>Promotional Banner</h3>
        <div className="form-group">
          <input type="text" placeholder="Title" className="form-input" />
        </div>
        <div className="form-group">
          <input type="text" placeholder="CTA Text" className="form-input" />
        </div>
        <button className="save-btn">Save Banner</button>
      </div>

      {/* Static Pages */}
      <div className="content-section">
        <h3>Static Pages</h3>
        <button className="add-btn"><FiPlus /> Add New Page</button>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page Title</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>About Us</td>
                <td className="actions">
                  <button className="action-btn edit"><FiEdit /></button>
                </td>
              </tr>
              <tr>
                <td>Contact Us</td>
                <td className="actions">
                  <button className="action-btn edit"><FiEdit /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-settings">
      <h1>Settings</h1>
      
             <div className="settings-tabs">
         <button className={`tab-btn ${settingsTab === 'general' ? 'active' : ''}`} onClick={() => setSettingsTab('general')}>
           General
         </button>
         <button className={`tab-btn ${settingsTab === 'store' ? 'active' : ''}`} onClick={() => setSettingsTab('store')}>
           Store
         </button>
         <button className={`tab-btn ${settingsTab === 'shipping' ? 'active' : ''}`} onClick={() => setSettingsTab('shipping')}>
           Shipping
         </button>
         <button className={`tab-btn ${settingsTab === 'payment' ? 'active' : ''}`} onClick={() => setSettingsTab('payment')}>
           Payment
         </button>
         <button className={`tab-btn ${settingsTab === 'email' ? 'active' : ''}`} onClick={() => setSettingsTab('email')}>
           Email
         </button>
         <button className={`tab-btn ${settingsTab === 'appearance' ? 'active' : ''}`} onClick={() => setSettingsTab('appearance')}>
           Appearance
         </button>
         <button className={`tab-btn ${settingsTab === 'admin' ? 'active' : ''}`} onClick={() => setSettingsTab('admin')}>
           Admin Roles
         </button>
       </div>

             {settingsTab === 'general' && (
         <div className="settings-content">
           <h3>General Settings</h3>
          <div className="form-group">
            <label>Store Name</label>
            <input type="text" className="form-input" defaultValue="EastEdge" />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input type="email" className="form-input" defaultValue="info@eastedge.in" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" className="form-input" defaultValue="+91 6302244544" />
          </div>
          <div className="form-group">
            <label>Store Logo</label>
            <input type="file" className="form-input" />
          </div>
          <button className="save-btn">Save General Settings</button>
        </div>
      )}

             {settingsTab === 'store' && (
         <div className="settings-content">
           <h3>Store Settings</h3>
          <div className="form-group">
            <label>Business Address</label>
            <textarea className="form-textarea" defaultValue="Malkajgiri, Hyderabad, Telangana, India"></textarea>
          </div>
          <div className="form-group">
            <label>Tax Rate (%)</label>
            <input type="number" className="form-input" defaultValue="18" />
          </div>
          <button className="save-btn">Save Store Settings</button>
        </div>
      )}

             {settingsTab === 'shipping' && (
         <div className="settings-content">
           <h3>Shipping Cost Settings</h3>
          <div className="form-group">
            <label>Free Shipping Threshold (₹)</label>
            <input type="number" className="form-input" placeholder="Orders above this amount will have free shipping" />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" /> Force Paid Shipping
            </label>
            <small>If enabled, free shipping threshold will be ignored.</small>
          </div>
          <button className="save-btn">Save Shipping Settings</button>
        </div>
      )}

             {settingsTab === 'payment' && (
         <div className="settings-content">
           <h3>Payment Gateways</h3>
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked /> Enable Razorpay
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked /> Enable Cash on Delivery (COD)
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" /> Enable Cashfree
            </label>
          </div>
          <button className="save-btn">Save Payment Settings</button>
        </div>
      )}

             {settingsTab === 'email' && (
         <div className="settings-content">
           <h3>Email Notifications</h3>
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked /> Send Order Confirmation to Customer
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked /> Notify Admin on New Order
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" defaultChecked /> Enable Shipping Updates
            </label>
          </div>
          <button className="save-btn">Save Email Settings</button>
        </div>
      )}

             {settingsTab === 'appearance' && (
         <div className="settings-content">
           <h3>Appearance</h3>
          <p>Appearance settings will be available in a future update.</p>
        </div>
      )}

             {settingsTab === 'admin' && (
         <div className="settings-content">
           <h3>User Role Management</h3>
          <button className="add-btn"><FiPlus /> Add User</button>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                                 <tr>
                   <td>Admin User</td>
                   <td>info@eastedge.in</td>
                   <td>Super Admin</td>
                   <td className="actions">
                     <button className="action-btn edit"><FiEdit /></button>
                   </td>
                 </tr>
                 <tr>
                   <td>Editor User</td>
                   <td>editor@eastedge.in</td>
                   <td>Editor</td>
                   <td className="actions">
                     <button className="action-btn edit"><FiEdit /></button>
                   </td>
                 </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'customers':
        return renderCustomers();
      case 'reviews':
        return renderReviews();
      case 'categories':
        return renderCategories();
      case 'discounts':
        return renderDiscounts();
      case 'content':
        return renderContentManager();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
                        <img src="/logo-footer.png" alt="EastEdge Logo" className="sidebar-logo" />
          <h2>EASTEDGE</h2>
        </div>
        
        <nav className="sidebar-nav">
                     <button 
             className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
             onClick={() => setActiveTab('dashboard')}
           >
             <FiBarChart2 /> Dashboard
           </button>
          <button 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FiPackage /> Products
          </button>
          <button 
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingCart /> Orders
          </button>
          <button 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <FiUsers /> Customers
          </button>
          <button 
            className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FiStar /> Reviews
          </button>
          <button 
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <FiTag /> Categories
          </button>
          <button 
            className={`nav-item ${activeTab === 'discounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('discounts')}
          >
            <FiTag /> Discounts
          </button>
          <button 
            className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <FiFileText /> Content
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
                 <header className="admin-header">
           <div className="header-left">
             <h1>{activeTab === 'dashboard' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
           </div>
          <div className="header-right">
            <div className="admin-info">
              <span className="admin-name">Admin</span>
              <span className="admin-role">Super Admin</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
