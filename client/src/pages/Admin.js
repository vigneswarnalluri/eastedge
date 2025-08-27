import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBarChart2, FiPackage, FiShoppingCart, FiUsers, FiStar, FiTag, FiFileText, FiSettings, FiLogOut, FiPlus, FiEye, FiEdit, FiTrash2, FiDownload, FiFilter, FiUpload, FiDollarSign } from 'react-icons/fi';
import api from '../services/api';
import './Admin.css';

const Admin = () => {
  const { logout, isAuthenticated, isAdmin, loading, user } = useAuth();
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
  
  // Sync sizes and colors with variants whenever variants change
  useEffect(() => {
    if (productForm.variants.length > 0) {
      const uniqueSizes = [...new Set(productForm.variants.map(v => v.size).filter(s => s))];
      const uniqueColors = [...new Set(productForm.variants.map(v => v.color).filter(c => c))];
      
      // Only update if the arrays are different to avoid infinite loops
      if (JSON.stringify(uniqueSizes.sort()) !== JSON.stringify(productForm.sizes.sort()) ||
          JSON.stringify(uniqueColors.sort()) !== JSON.stringify(productForm.colors.sort())) {
        setProductForm(prev => ({
          ...prev,
          sizes: uniqueSizes,
          colors: uniqueColors
        }));
      }
    }
  }, [productForm.variants]);
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStats, setOrderStats] = useState({});
  const [ordersPagination, setOrdersPagination] = useState({});
  const [showViewOrder, setShowViewOrder] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  
  // Customers state
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerStats, setCustomerStats] = useState({});
  const [customersPagination, setCustomersPagination] = useState({});
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState('all');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    description: '', 
    status: 'active',
    parentCategory: null
  });
  
  // View product state
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showViewProduct, setShowViewProduct] = useState(false);
  
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

  // Fetch orders from backend
  const fetchOrders = async (page = 1, status = 'all') => {
    try {
      setOrdersLoading(true);
      const response = await api.get(`/api/orders/admin/all?page=${page}&status=${status}`);
      
      if (response.data.success) {
        setOrders(response.data.orders);
        setOrdersPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      const response = await api.get('/api/orders/admin/stats');
      if (response.data.success) {
        setOrderStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  // Fetch customers
  const fetchCustomers = async (page = 1, status = 'all', search = '') => {
    try {
      setCustomersLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: status,
        search: search
      });
      
      const response = await api.get(`/api/users/admin/customers?${params}`);
      if (response.data.success) {
        setCustomers(response.data.customers);
        setCustomerStats(response.data.analytics);
        setCustomersPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch customer details
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await api.get(`/api/users/admin/customers/${customerId}`);
      if (response.data.success) {
        setViewingCustomer(response.data);
        setShowCustomerModal(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      alert('Failed to fetch customer details');
    }
  };

  // Update customer status (block/unblock)
  const handleCustomerStatusChange = async (customerId, isBlocked, reason = '') => {
    try {
      const response = await api.put(`/api/users/admin/customers/${customerId}/status`, {
        isBlocked,
        reason
      });
      
      if (response.data.success) {
        alert(response.data.message);
        // Refresh customers list
        fetchCustomers(customersPagination.currentPage, customerStatusFilter, customerSearch);
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Failed to update customer status');
    }
  };

  // Handle customer search
  const handleCustomerSearch = (searchTerm) => {
    setCustomerSearch(searchTerm);
    fetchCustomers(1, customerStatusFilter, searchTerm);
  };

  // Handle customer status filter change
  const handleCustomerStatusFilterChange = (newStatus) => {
    setCustomerStatusFilter(newStatus);
    fetchCustomers(1, newStatus, customerSearch);
  };

  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  // Fetch orders and stats when component mounts
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
      fetchOrders();
      fetchOrderStats();
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch customers when customers tab is active
  useEffect(() => {
    if (isAuthenticated && isAdmin && activeTab === 'customers') {
      fetchCustomers();
    }
  }, [isAuthenticated, isAdmin, activeTab]);
  
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
   const openAddProductModal = () => {
    setShowAddProduct(true);
    document.body.classList.add('form-modal-open');
  };

  const handleAddProduct = async () => {
    console.log('Attempting to add product:', productForm);
    
    if (!productForm.name || !productForm.sku || !productForm.category || !productForm.price || !productForm.description || !productForm.image) {
      alert('Please fill in all required fields: Name, SKU, Category, Price, Description, and Image URL');
      return;
    }
    
    try {
      // For the new hierarchical category system, we don't need to find category by name
      // The category field now contains the category name directly
      if (!productForm.category) {
        alert('Please select a category.');
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

      // Only include sizes and colors that have variants
      const sizesWithVariants = [...new Set(processedVariants.map(v => v.size).filter(s => s))];
      const colorsWithVariants = [...new Set(processedVariants.map(v => v.color).filter(c => c))];

      const productData = {
        name: productForm.name,
        sku: productForm.sku,
        description: productForm.description,
        price: parseFloat(productForm.price),
        salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
        category: productForm.category, // Send category name directly
        categoryName: productForm.category, // Send category name
        subCategory: productForm.subCategory || null,
        image: productForm.image,
        images: productForm.images,
        stockQuantity: parseInt(productForm.stockQuantity) || 0,
        sizes: sizesWithVariants.length > 0 ? sizesWithVariants : ['One Size'],
        colors: processedColors.filter(color => {
          // Only include colors that have variants
          if (typeof color === 'string') {
            return colorsWithVariants.includes(color);
          } else {
            return colorsWithVariants.includes(color.name);
          }
        }),
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
      
      // Close the modal and remove the class
      handleCloseAddProduct();
      
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

  const handleCloseAddProduct = () => {
    setShowAddProduct(false);
    document.body.classList.remove('form-modal-open');
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
        // For the new hierarchical category system, we don't need to find category by name
        // The category field now contains the category name directly
        if (!productForm.category) {
          alert('Please select a category.');
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

        // Only include sizes and colors that have variants
        const sizesWithVariants = [...new Set(processedVariants.map(v => v.size).filter(s => s))];
        const colorsWithVariants = [...new Set(processedVariants.map(v => v.color).filter(c => c))];

        const productData = {
          name: productForm.name,
          sku: productForm.sku,
          description: productForm.description,
          price: parseFloat(productForm.price),
          salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
          category: productForm.category, // Send category name directly
          categoryName: productForm.category, // Send category name
          subCategory: productForm.subCategory || null,
          image: productForm.image,
          images: productForm.images,
          stockQuantity: parseInt(productForm.stockQuantity) || 0,
          sizes: sizesWithVariants.length > 0 ? sizesWithVariants : ['One Size'],
          colors: processedColors.filter(color => {
            // Only include colors that have variants
            if (typeof color === 'string') {
              return colorsWithVariants.includes(color);
            } else {
              return colorsWithVariants.includes(color.name);
            }
          }),
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

  // View product function
  const handleViewProduct = (product) => {
    setViewingProduct(product);
    setShowViewProduct(true);
  };

  // View order function
  const handleViewOrder = (order) => {
    console.log('handleViewOrder called with order:', order); // Debug log
    setViewingOrder(order);
    setShowViewOrder(true);
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/api/orders/admin/${orderId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        // Update local state
        setOrders(orders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        
        // Refresh order stats
        fetchOrderStats();
        
        // Show success message
        alert('Order status updated successfully!');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
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

  // Category structure with main categories and sub-categories
  const categoryStructure = {
    "Electronics": [
      "Smartphones & Accessories",
      "Laptops & Computers", 
      "Cameras & Photography",
      "Wearable Technology",
      "Gaming Consoles & Accessories",
      "Smart Home Devices"
    ],
    "Fashion and Apparel": [
      "Women's Clothing",
      "Men's Clothing", 
      "Shoes",
      "Accessories",
      "Kids & Baby Clothing"
    ],
    "Food and Beverages": [
      "Grocery & Staples",
      "Organic & Health Foods",
      "Beverages", 
      "Snacks & Confectionery",
      "Gourmet & Specialty Foods"
    ],
    "DIY and Hardware": [
      "Power Tools",
      "Hand Tools",
      "Building Materials",
      "Paint Supplies",
      "Home Improvement Fixtures"
    ],
    "Health, Personal Care, and Beauty": [
      "Skincare",
      "Haircare",
      "Makeup & Cosmetics",
      "Personal Hygiene",
      "Health & Wellness Equipment"
    ],
    "Furniture and Home Décor": [
      "Living Room Furniture",
      "Bedroom Furniture",
      "Office Furniture",
      "Lighting Fixtures",
      "Decorative Accessories"
    ],
    "Media": [
      "Books",
      "Music",
      "Movies & TV Shows",
      "Video Games"
    ],
    "Toys and Hobbies": [
      "Educational Toys",
      "Outdoor Toys",
      "Board Games & Puzzles",
      "Arts & Crafts Supplies"
    ]
  };

  // Get main categories (parent categories)
  const mainCategories = Object.keys(categoryStructure);
  
  // Get sub-categories for a selected main category
  const getSubCategories = (mainCategory) => {
    return categoryStructure[mainCategory] || [];
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <div className="stat-value">₹{orderStats.totalRevenue?.toLocaleString() || 0}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiShoppingCart />
          </div>
          <div className="stat-content">
            <div className="stat-value">{orderStats.totalOrders || 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <div className="stat-value">{products.length}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <div className="stat-value">{customers.length}</div>
            <div className="stat-label">Total Customers</div>
          </div>
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
            <FiDownload /> Export Orders
          </button>
        </div>
        
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>₹{order.totalPrice?.toLocaleString() || 0}</td>
                  <td><span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span></td>
                  <td className="actions">
                    <button className="action-btn view" onClick={() => handleViewOrder(order)} title="View Order Details">
                      <FiEye />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteOrder(order._id)} title="Delete Order">
                      <FiTrash2 />
                    </button>
                  </td>
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
          <button className="export-btn" onClick={handleExportOrders}>
            <FiDownload /> Export Revenue
          </button>
        </div>
        
        <div className="revenue-stats">
          <div className="revenue-stat">
            <span className="stat-label">Pending Orders:</span>
            <span className="stat-value">{orderStats.pendingOrders || 0}</span>
          </div>
          <div className="revenue-stat">
            <span className="stat-label">Processing Orders:</span>
            <span className="stat-value">{orderStats.processingOrders || 0}</span>
          </div>
          <div className="revenue-stat">
            <span className="stat-label">Shipped Orders:</span>
            <span className="stat-value">{orderStats.shippedOrders || 0}</span>
          </div>
          <div className="revenue-stat">
            <span className="stat-label">Delivered Orders:</span>
            <span className="stat-value">{orderStats.deliveredOrders || 0}</span>
          </div>
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
            
            {/* Main Categories Only */}
            {mainCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button className="add-btn" onClick={openAddProductModal}>
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddProduct && (
        <div className="form-modal" onClick={handleCloseAddProduct}>
          <div className="form-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Product</h3>
              <div className="modal-hint">Click outside to close</div>
              <button 
                className="close-btn" 
                onClick={handleCloseAddProduct}
              >
                ×
              </button>
            </div>
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
                  
                  {/* Main Categories Only */}
                  {mainCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
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
                  {productForm.category && getSubCategories(productForm.category).map(subCategory => (
                    <option key={subCategory} value={subCategory}>{subCategory}</option>
                  ))}
                </select>
                <small className="form-help">
                  {!productForm.category 
                    ? 'Select a main category first to see available sub-categories' 
                    : `Available sub-categories for ${productForm.category}`
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
                 <div className="variants-controls">
                   <div className="variant-input-group">
                     <label>Sizes:</label>
                     <div className="input-with-button">
                       <input
                         type="text"
                         className="form-input"
                         placeholder="Add sizes (e.g., S, M, L, XL)"
                         value={productForm.sizes.join(', ')}
                         onChange={(e) => {
                           const newSizes = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                           console.log('Sizes input changed:', e.target.value);
                           console.log('Processed sizes:', newSizes);
                           
                           // Remove variants that no longer have valid sizes
                           const newVariants = productForm.variants.filter(variant => 
                             newSizes.includes(variant.size) || !variant.size
                           );
                           
                           setProductForm({
                             ...productForm, 
                             sizes: newSizes,
                             variants: newVariants
                           });
                         }}
                       />
                       <button
                         type="button"
                         className="add-variant-plus-btn"
                         onClick={() => {
                           const newSize = prompt('Enter new size:');
                           if (newSize && newSize.trim()) {
                             const updatedSizes = [...productForm.sizes, newSize.trim()];
                             console.log('Adding new size:', newSize.trim());
                             console.log('Updated sizes array:', updatedSizes);
                             setProductForm({
                               ...productForm, 
                               sizes: updatedSizes
                             });
                           }
                         }}
                       >
                         +
                       </button>
                     </div>
                   </div>
                   <div className="variant-input-group">
                     <label>Colors:</label>
                     <div className="input-with-button">
                       <input
                         type="text"
                         className="form-input"
                         placeholder="Add colors (e.g., Red, Blue, Black)"
                         value={productForm.colors.join(', ')}
                         onChange={(e) => {
                           const newColors = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                           
                           // Remove variants that no longer have valid colors
                           const newVariants = productForm.variants.filter(variant => 
                             newColors.includes(variant.color) || !variant.color
                           );
                           
                           setProductForm({
                             ...productForm, 
                             colors: newColors,
                             variants: newVariants
                           });
                         }}
                       />
                       <button
                         type="button"
                         className="add-variant-plus-btn"
                         onClick={() => {
                           const newColor = prompt('Enter new color:');
                           if (newColor && newColor.trim()) {
                             setProductForm({
                               ...productForm, 
                               colors: [...productForm.colors, newColor.trim()]
                             });
                           }
                         }}
                       >
                         +
                       </button>
                     </div>
                   </div>
                 </div>
                 
                 {/* Variants Table */}
                 <div className="variants-table">
                   <h4>Variant Combinations</h4>
                   
                   {/* Add Custom Variant Button - Always Visible */}
                   <div className="add-custom-variant-top">
                     <button
                       type="button"
                       className="add-variant-btn"
                       onClick={() => {
                         const newVariant = {
                           size: '',
                           color: '',
                           price: '',
                           stock: '',
                           sku: ''
                         };
                         setProductForm({
                           ...productForm, 
                           variants: [...productForm.variants, newVariant]
                         });
                       }}
                     >
                       + Add Custom Variant
                     </button>
                   </div>
                   
                   {productForm.sizes.length > 0 && productForm.colors.length > 0 ? (
                     <>
                       <div className="variant-row header">
                         <span>Size</span>
                         <span>Color</span>
                         <span>Price (₹)</span>
                         <span>Stock</span>
                         <span>SKU</span>
                         <span>Actions</span>
                       </div>
                       {productForm.sizes.flatMap(size => 
                         productForm.colors.map(color => {
                           const existingVariant = productForm.variants.find(v => v.size === size && v.color === color);
                           return (
                             <div key={`${size}-${color}`} className="variant-row">
                               <span className="variant-size">{size}</span>
                               <span className="variant-color">{color}</span>
                               <input
                                 type="number"
                                 className="variant-input"
                                 placeholder="Price"
                                 value={existingVariant?.price || ''}
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
                                 value={existingVariant?.stock || ''}
                                 onChange={(e) => {
                                   const newVariants = [...productForm.variants];
                                   const existingIndex = newVariants.findIndex(v => v.size === size && v.color === color);
                                   if (existingIndex >= 0) {
                                     newVariants[existingIndex].stock = e.target.value;
                                   } else {
                                     newVariants.push({
                                       size,
                                       color,
                                       price: existingVariant?.price || '',
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
                               <button
                                 type="button"
                                 className="variant-remove-btn"
                                 onClick={() => {
                                   const newVariants = productForm.variants.filter(v => !(v.size === size && v.color === color));
                                   setProductForm({...productForm, variants: newVariants});
                                   // The useEffect hook will automatically sync sizes and colors
                                 }}
                               >
                                 ×
                               </button>
                             </div>
                           );
                         })
                       )}
                       
                       {/* Add Custom Variant Button */}
                       <div className="add-custom-variant">
                         <button
                           type="button"
                           className="add-variant-btn"
                           onClick={() => {
                             const newVariant = {
                               size: '',
                               color: '',
                               price: '',
                               stock: '',
                               sku: ''
                             };
                             setProductForm({
                               ...productForm, 
                               variants: [...productForm.variants, newVariant]
                             });
                           }}
                         >
                           + Add Custom Variant
                         </button>
                       </div>
                     </>
                   ) : (
                     <div className="no-variants">
                       <p>Add sizes and colors to see variant combinations</p>
                       <small>Or use the "Add Custom Variant" button above to create variants manually</small>
                     </div>
                   )}
                   
                   {/* Custom Variants Section */}
                   {productForm.variants.length > 0 && (
                     <div className="custom-variants">
                       <h4>Custom Variants</h4>
                       {productForm.variants.map((variant, index) => (
                         <div key={index} className="custom-variant-row">
                           <input
                             type="text"
                             className="variant-input"
                             placeholder="Size"
                             value={variant.size}
                             onChange={(e) => {
                               const newVariants = [...productForm.variants];
                               newVariants[index].size = e.target.value;
                               setProductForm({...productForm, variants: newVariants});
                             }}
                           />
                           <input
                             type="text"
                             className="variant-input"
                             placeholder="Color"
                             value={variant.color}
                             onChange={(e) => {
                               const newVariants = [...productForm.variants];
                               newVariants[index].color = e.target.value;
                               setProductForm({...productForm, variants: newVariants});
                             }}
                           />
                           <input
                             type="number"
                             className="variant-input"
                             placeholder="Price"
                             value={variant.price}
                             onChange={(e) => {
                               const newVariants = [...productForm.variants];
                               newVariants[index].price = e.target.value;
                               setProductForm({...productForm, variants: newVariants});
                             }}
                           />
                           <input
                             type="number"
                             className="variant-input"
                             placeholder="Stock"
                             value={variant.stock}
                             onChange={(e) => {
                               const newVariants = [...productForm.variants];
                               newVariants[index].stock = e.target.value;
                               setProductForm({...productForm, variants: newVariants});
                             }}
                           />
                           <input
                             type="text"
                             className="variant-input"
                             placeholder="SKU"
                             value={variant.sku}
                             onChange={(e) => {
                               const newVariants = [...productForm.variants];
                               newVariants[index].sku = e.target.value;
                               setProductForm({...productForm, variants: newVariants});
                             }}
                           />
                           <button
                             type="button"
                             className="variant-remove-btn"
                             onClick={() => {
                               const newVariants = productForm.variants.filter((_, i) => i !== index);
                               setProductForm({...productForm, variants: newVariants});
                             }}
                           >
                             ×
                           </button>
                         </div>
                       ))}
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
                           <div className="placeholder-image">No Image</div>
                         )}
                       </div>
                     </div>
                   </td>
                   <td className="sku-cell">{product.sku || 'N/A'}</td>
                   <td>{product.categoryName}</td>
                   <td>{product.subCategory || 'N/A'}</td>
                   <td>₹{product.price}</td>
                   <td>{product.salePrice ? `₹${product.salePrice}` : 'N/A'}</td>
                   <td>{product.stockQuantity}</td>
                   <td>
                     {/* Status badges removed */}
                   </td>
                   <td className="actions">
                     <button className="action-btn view" onClick={() => handleViewProduct(product)}><FiEye /></button>
                     <button className="action-btn edit" onClick={() => handleEditProduct(product)}><FiEdit /></button>
                     <button className="action-btn delete" onClick={() => handleDeleteProduct(product._id)}><FiTrash2 /></button>
                   </td>
                 </tr>
               ))
             )}
           </tbody>
        </table>
      </div>

      {/* View Product Modal */}
      {showViewProduct && viewingProduct && (
        <div className="form-modal" onClick={() => setShowViewProduct(false)}>
          <div className="form-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Product Details</h3>
              <div className="modal-hint">Click outside to close</div>
              <button 
                className="close-btn" 
                onClick={() => setShowViewProduct(false)}
              >
                ×
              </button>
            </div>
            
            <div className="product-view-grid">
              <div className="product-image-section">
                <div className="product-image-large">
                  {viewingProduct.image ? (
                    <img src={viewingProduct.image} alt={viewingProduct.name} />
                  ) : (
                    <div className="placeholder-image-large">No Image</div>
                  )}
                </div>
              </div>
              
              <div className="product-details-section">
                <div className="detail-group">
                  <label>Product Name:</label>
                  <span className="detail-value">{viewingProduct.name}</span>
                </div>
                
                <div className="detail-group">
                  <label>SKU:</label>
                  <span className="detail-value">{viewingProduct.sku || 'N/A'}</span>
                </div>
                
                <div className="detail-group">
                  <label>Category:</label>
                  <span className="detail-value">{viewingProduct.categoryName || 'N/A'}</span>
                </div>
                
                <div className="detail-group">
                  <label>Sub-Category:</label>
                  <span className="detail-value">{viewingProduct.subCategory || 'N/A'}</span>
                </div>
                
                <div className="detail-group">
                  <label>Price:</label>
                  <span className="detail-value">₹{viewingProduct.price}</span>
                </div>
                
                <div className="detail-group">
                  <label>Sale Price:</label>
                  <span className="detail-value">
                    {viewingProduct.salePrice ? `₹${viewingProduct.salePrice}` : 'N/A'}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Stock Quantity:</label>
                  <span className="detail-value">{viewingProduct.stockQuantity}</span>
                </div>
                
                <div className="detail-group">
                  <label>Description:</label>
                  <span className="detail-value description-text">
                    {viewingProduct.description || 'No description available'}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Status:</label>
                  {/* Status badges removed */}
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="edit-btn" 
                onClick={() => {
                  setShowViewProduct(false);
                  setEditingProduct(viewingProduct);
                  setShowAddProduct(true);
                }}
              >
                <FiEdit /> Edit Product
              </button>
              <button 
                className="close-btn-secondary" 
                onClick={() => setShowViewProduct(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewOrder && viewingOrder && (
        <div className="form-modal" onClick={() => setShowViewOrder(false)}>
          <div className="form-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <div className="modal-hint">Click outside to close</div>
              <button 
                className="close-btn" 
                onClick={() => setShowViewOrder(false)}
              >
                ×
              </button>
            </div>
            
            <div className="order-view-grid">
              <div className="order-info-section">
                <div className="detail-group">
                  <label>Order ID:</label>
                  <span className="detail-value">#{viewingOrder.id}</span>
                </div>
                
                <div className="detail-group">
                  <label>Customer:</label>
                  <span className="detail-value">{viewingOrder.customer || 'N/A'}</span>
                </div>
                
                <div className="detail-group">
                  <label>Order Date:</label>
                  <span className="detail-value">{viewingOrder.date || 'N/A'}</span>
                </div>
                
                <div className="detail-group">
                  <label>Total Amount:</label>
                  <span className="detail-value">₹{viewingOrder.amount || 'N/A'}</span>
                </div>
                
                <div className="detail-group">
                  <label>Payment Status:</label>
                  <span className="detail-value">{viewingOrder.payment || 'N/A'}</span>
                </div>
                
                <div className="detail-group">
                  <label>Order Status:</label>
                  <span className={`status-badge ${viewingOrder.status || 'processing'}`}>
                    {viewingOrder.status || 'Processing'}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Delivery Status:</label>
                  <span className="detail-value">{viewingOrder.delivery || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="close-btn-secondary" 
                onClick={() => setShowViewOrder(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="export-btn" onClick={handleExportOrders}>
            <FiDownload /> Export Orders
          </button>
        </div>
      </div>
      
      <div className="table-container">
        {ordersLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : (
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>₹{order.totalPrice?.toLocaleString() || 0}</td>
                    <td>{order.paymentMethod}</td>
                    <td><span className={`status-badge ${order.status?.toLowerCase()}`}>{order.status}</span></td>
                    <td>
                      <select 
                        className="status-select"
                        value={order.status || 'Pending'}
                        onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="actions">
                      <button className="action-btn view" onClick={() => handleViewOrder(order)} title="View Order Details">
                        <FiEye />
                      </button>
                      <button className="action-btn delete" onClick={() => handleDeleteOrder(order._id)} title="Delete Order">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="pagination">
        <button 
          className="page-btn" 
          disabled={!ordersPagination.hasPrev}
          onClick={() => fetchOrders(ordersPagination.currentPage - 1, selectedStatus)}
        >
          ‹ Prev
        </button>
        <span className="page-info">
          Page {ordersPagination.currentPage} of {ordersPagination.totalPages}
        </span>
        <button 
          className="page-btn" 
          disabled={!ordersPagination.hasNext}
          onClick={() => fetchOrders(ordersPagination.currentPage + 1, selectedStatus)}
        >
          Next ›
        </button>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="admin-section">
      <div className="section-header">
        <h1>Customer Management</h1>
        <div className="header-actions">
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search customers..."
              value={customerSearch}
              onChange={(e) => handleCustomerSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={customerStatusFilter}
              onChange={(e) => handleCustomerStatusFilterChange(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{customerStats.totalCustomers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active Customers</h3>
          <p>{customerStats.activeCustomers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Blocked Customers</h3>
          <p>{customerStats.blockedCustomers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>New This Month</h3>
          <p>{customerStats.newCustomersThisMonth || 0}</p>
        </div>
      </div>

      {/* Customers Table */}
      {customersLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="no-data">
          <p>No customers found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>#{customer._id.slice(-6)}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || 'N/A'}</td>
                    <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${customer.isBlocked ? 'blocked' : 'active'}`}>
                        {customer.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn view"
                          onClick={() => fetchCustomerDetails(customer._id)}
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          className={`action-btn ${customer.isBlocked ? 'unblock' : 'block'}`}
                          onClick={() => {
                            const action = customer.isBlocked ? 'unblock' : 'block';
                            const reason = customer.isBlocked ? '' : prompt('Reason for blocking:');
                            handleCustomerStatusChange(customer._id, !customer.isBlocked, reason);
                          }}
                          title={customer.isBlocked ? 'Unblock Customer' : 'Block Customer'}
                        >
                          {customer.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {customersPagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => fetchCustomers(customersPagination.currentPage - 1, customerStatusFilter, customerSearch)}
                disabled={!customersPagination.hasPrevPage}
              >
                ‹ Prev
              </button>
              <div className="page-info">
                Page {customersPagination.currentPage} of {customersPagination.totalPages}
              </div>
              <button
                className="page-btn"
                onClick={() => fetchCustomers(customersPagination.currentPage + 1, customerStatusFilter, customerSearch)}
                disabled={!customersPagination.hasNextPage}
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}
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
        <div className="form-modal" onClick={() => setShowAddCategory(false)}>
          <div className="form-content" onClick={(e) => e.stopPropagation()}>
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

  const handleStatusFilterChange = (newStatus) => {
    setSelectedStatus(newStatus);
    fetchOrders(1, newStatus); // Reset to first page when filter changes
  };

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/api/orders/admin/${orderId}`);
        // Refresh orders and stats after deletion
        fetchOrders();
        fetchOrderStats();
        alert('Order deleted successfully');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order');
      }
    }
  };

  // Check admin status
  const checkAdminStatus = async () => {
    try {
      const response = await api.get('/api/users/check-admin');
      if (response.data.success) {
        console.log('🔍 Admin status check:', response.data);
        if (!response.data.isAdmin) {
          alert('You are not an admin. You need admin privileges to access this page.');
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // Make current user admin (for testing)
  const makeCurrentUserAdmin = async () => {
    try {
      const response = await api.put(`/api/users/make-admin/${user._id}`);
      if (response.data.success) {
        alert('You are now an admin! Please refresh the page.');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      alert('Failed to make user admin. Please try again.');
    }
  };

  // View order modal
  const renderViewOrderModal = () => {
    if (!viewingOrder) return null;

    console.log('Rendering modal with order:', viewingOrder); // Debug log
    console.log('Order user data:', viewingOrder.user); // Debug user data
    console.log('Order shipping data:', viewingOrder.shippingAddress); // Debug shipping data

    // Fallback data in case the order structure is incomplete
    const orderData = {
      id: viewingOrder._id || 'N/A',
      customerName: viewingOrder.user?.name || viewingOrder.customerName || 'N/A',
      customerEmail: viewingOrder.user?.email || viewingOrder.customerEmail || 'N/A',
      orderDate: viewingOrder.createdAt || viewingOrder.orderDate || 'N/A',
      street: viewingOrder.shippingAddress?.street || viewingOrder.street || 'N/A',
      city: viewingOrder.shippingAddress?.city || viewingOrder.city || 'N/A',
      state: viewingOrder.shippingAddress?.state || viewingOrder.state || 'N/A',
      zipCode: viewingOrder.shippingAddress?.zipCode || viewingOrder.zipCode || 'N/A',
      country: viewingOrder.shippingAddress?.country || viewingOrder.country || 'N/A',
      paymentMethod: viewingOrder.paymentMethod || 'N/A',
      status: viewingOrder.status || 'Pending',
      isPaid: viewingOrder.isPaid || false,
      paidAt: viewingOrder.paidAt || null,
      totalPrice: viewingOrder.totalPrice || 0,
      shippingPrice: viewingOrder.shippingPrice || 0,
      orderItems: viewingOrder.orderItems || []
    };

    console.log('Processed order data:', orderData); // Debug processed data

    return (
      <div className="modal-overlay" onClick={() => setShowViewOrder(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Order Details - #{orderData.id.slice(-6)}</h2>
            <button className="modal-close" onClick={() => setShowViewOrder(false)}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="order-details-grid">
              {/* Customer Information */}
              <div className="order-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Name:</strong> 
                    <span className="order-value">{orderData.customerName}</span>
                  </div>
                  <div className="info-item">
                    <strong>Email:</strong> 
                    <span className="order-value">{orderData.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="order-section">
                <h3>Shipping Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Street:</strong> 
                    <span className="order-value">{orderData.street}</span>
                  </div>
                  <div className="info-item">
                    <strong>City:</strong> 
                    <span className="order-value">{orderData.city}</span>
                  </div>
                  <div className="info-item">
                    <strong>State:</strong> 
                    <span className="order-value">{orderData.state}</span>
                  </div>
                  <div className="info-item">
                    <strong>ZIP Code:</strong> 
                    <span className="order-value">{orderData.zipCode}</span>
                  </div>
                  <div className="info-item">
                    <strong>Country:</strong> 
                    <span className="order-value">{orderData.country}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="order-section">
                <h3>Payment Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Method:</strong> 
                    <span className="order-value">{orderData.paymentMethod}</span>
                  </div>
                  <div className="info-item">
                    <strong>Status:</strong> 
                    <span className="order-value">{orderData.status}</span>
                  </div>
                  <div className="info-item">
                    <strong>Paid:</strong> 
                    <span className="order-value">{orderData.isPaid ? 'Yes' : 'No'}</span>
                  </div>
                  {orderData.isPaid && (
                    <div className="info-item">
                      <strong>Paid At:</strong> 
                      <span className="order-value">{new Date(orderData.paidAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="order-section full-width">
                <h3>Order Items</h3>
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variant</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="product-name-cell">
                          <div className="product-name">{item.product?.name || item.name || 'N/A'}</div>
                          <div className="product-sku">{item.sku || 'No SKU'}</div>
                        </td>
                        <td className="variant-cell">
                          {item.selectedSize || item.selectedColor ? (
                            <>
                              {item.selectedSize && <span className="variant-tag size-tag">{item.selectedSize}</span>}
                              {item.selectedColor && <span className="variant-tag color-tag">{item.selectedColor}</span>}
                            </>
                          ) : (
                            <span className="no-variant">No variant</span>
                          )}
                        </td>
                        <td>{item.quantity}</td>
                        <td>₹{item.variantPrice || item.price || 0}</td>
                        <td>₹{((item.variantPrice || item.price || 0) * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary */}
              <div className="order-section full-width">
                <h3>Order Summary</h3>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₹{orderData.totalPrice - orderData.shippingPrice}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>₹{orderData.shippingPrice}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₹{orderData.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowViewOrder(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // View customer modal
  const renderCustomerModal = () => {
    if (!viewingCustomer) return null;

    const { customer, orders, stats } = viewingCustomer;

    return (
      <div className="modal-overlay" onClick={() => setShowCustomerModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Customer Details - {customer.name}</h2>
            <button className="modal-close" onClick={() => setShowCustomerModal(false)}>×</button>
          </div>
          
          <div className="modal-body">
            <div className="order-details-grid">
              {/* Customer Information */}
              <div className="order-section">
                <h3>Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Name:</strong> 
                    <span className="order-value">{customer.name}</span>
                  </div>
                  <div className="info-item">
                    <strong>Email:</strong> 
                    <span className="order-value">{customer.email}</span>
                  </div>
                  <div className="info-item">
                    <strong>Phone:</strong> 
                    <span className="order-value">{customer.phone || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Joined:</strong> 
                    <span className="order-value">{new Date(customer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-item">
                    <strong>Status:</strong> 
                    <span className={`order-value status-badge ${customer.isBlocked ? 'blocked' : 'active'}`}>
                      {customer.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                  {customer.isBlocked && customer.blockReason && (
                    <div className="info-item">
                      <strong>Block Reason:</strong> 
                      <span className="order-value">{customer.blockReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Statistics */}
              <div className="order-section">
                <h3>Customer Statistics</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Total Orders:</strong> 
                    <span className="order-value">{stats.totalOrders}</span>
                  </div>
                  <div className="info-item">
                    <strong>Total Spent:</strong> 
                    <span className="order-value">₹{stats.totalSpent?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Average Order:</strong> 
                    <span className="order-value">₹{stats.averageOrderValue?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Last Order:</strong> 
                    <span className="order-value">
                      {stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString() : 'No orders'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="order-section full-width">
                <h3>Recent Orders</h3>
                {orders.length === 0 ? (
                  <p>No orders found</p>
                ) : (
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>#{order._id.slice(-6)}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>₹{order.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className={`btn-primary ${customer.isBlocked ? 'unblock' : 'block'}`}
              onClick={() => {
                const reason = customer.isBlocked ? '' : prompt('Reason for blocking:');
                handleCustomerStatusChange(customer._id, !customer.isBlocked, reason);
                setShowCustomerModal(false);
              }}
            >
              {customer.isBlocked ? 'Unblock Customer' : 'Block Customer'}
            </button>
            <button className="btn-secondary" onClick={() => setShowCustomerModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
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
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <div className="header-actions">
              <button className="admin-btn" onClick={handleLogout}>
                <FiLogOut />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content-area">
          {renderContent()}
        </div>
        
        {/* View Order Modal */}
        {showViewOrder && renderViewOrderModal()}
        
        {/* View Customer Modal */}
        {showCustomerModal && renderCustomerModal()}
      </main>
    </div>
  );
};

export default Admin;
