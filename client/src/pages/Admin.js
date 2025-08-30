import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { scrollToTop } from '../utils/scrollToTop';
import { FiBarChart2, FiPackage, FiShoppingCart, FiUsers, FiStar, FiTag, FiFileText, FiSettings, FiLogOut, FiPlus, FiEye, FiEdit, FiTrash2, FiDownload, FiUpload, FiDollarSign, FiMessageSquare } from 'react-icons/fi';
import api from '../services/api';
import './Admin.css';

const Admin = () => {
  const { logout, isAuthenticated, isAdmin, loading, user } = useAuth();
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();
  
     // All hooks must be called before any conditional returns
   const [activeTab, setActiveTab] = useState('dashboard');
     const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [settingsTab, setSettingsTab] = useState('general');
  
  // Content Manager State
  const [contentData, setContentData] = useState({
    announcement: {
      text: 'Hii',
      link: 'Visit',
      linkType: 'none',
      buttonText: 'Learn More',
      targetPage: '',
      enabled: false
    },
    heroSlides: [
      {
        title: 'Title',
        description: 'The wait is over! Our most anticipated collection is finally here.',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        image: '',
        imagePreview: ''
      }
    ],
    promotionalBanner: {
      title: '',
      ctaText: '',
      enabled: false
    },
    staticPages: [
      { title: 'About Us', slug: 'about-us', content: '', published: true },
      { title: 'Contact Us', slug: 'contact-us', content: '', published: true }
    ]
  });

  // Settings State
  // Debug useEffect for content data
  useEffect(() => {
    console.log('Content data updated:', contentData);
  }, [contentData]);

  // Load content from backend
  const loadContent = async () => {
    try {
      const response = await api.get('/api/content');
      console.log('Content loaded from backend:', response.data);
      setContentData(response.data);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  // Load settings from backend
  const loadSettings = async () => {
    try {
      console.log('🔄 Loading settings from backend...');
      // Settings are already loaded in the context
      console.log('✅ Settings loaded from context:', settings);
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      // Settings will use default values if loading fails
    }
  };

  // Load content when component mounts
  useEffect(() => {
    loadContent();
    loadSettings();
  }, []);

  // Update local settingsData when context settings change
  useEffect(() => {
    setSettingsData(settings);
  }, [settings]);

  // Use settings from context instead of local state
  const [settingsData, setSettingsData] = useState(settings);
  
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
    trending: false,
    washDetails: {
      washing: '',
      drying: '',
      ironing: '',
      bleaching: '',
      dryCleaning: '',
      additionalCare: ''
    }
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

  // Review management state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState({});
  const [reviewsPagination, setReviewsPagination] = useState({});
  const [reviewStatusFilter, setReviewStatusFilter] = useState('all');
  const [reviewSearch, setReviewSearch] = useState('');

  // Fetch reviews function - moved to top to fix hoisting issue
  const fetchReviews = async (page = 1, status = 'all', search = '') => {
    try {
      setReviewsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: status,
        search: search
      });
      
      const response = await api.get(`/api/reviews/admin?${params}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setReviewStats(response.data.analytics);
        setReviewsPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Discount management state
  const [discounts, setDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);
  const [showAddDiscount, setShowAddDiscount] = useState(false);
  const [showEditDiscount, setShowEditDiscount] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountForm, setDiscountForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    maxUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
    description: ''
  });

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    description: '', 
    image: '',
    imagePreview: '',
    status: 'active',
    parentCategory: null
  });
  
  // Category search and filter state
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryStatusFilter, setCategoryStatusFilter] = useState('all');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState('all');
  
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
        api.get('/api/categories/admin/all')
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

  // Fetch revenue data with date filtering
  const fetchRevenueData = async () => {
    try {
      let url = '/api/orders/admin/stats';
      const params = new URLSearchParams();
      
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate);
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate);
      }
      if (selectedStatus && selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      if (response.data.success) {
        setOrderStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    if (!status || status === 'No Orders') return 'no-orders';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'shipped':
        return 'shipped';
      case 'delivered':
        return 'delivered';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await api.get('/api/categories/admin/all');
      console.log('Categories response:', response.data);
      
      if (Array.isArray(response.data)) {
        setCategories(response.data);
        console.log('Categories set successfully:', response.data.length);
      } else {
        console.error('Invalid categories response format:', response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error response:', error.response?.data);
      setCategories([]);
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

  // Handle date range changes
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  // Fetch data when component mounts
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
      fetchOrders();
      fetchCustomers();
      fetchReviews();
      fetchCategories();
      scrollToTop();
    }
  }, [isAuthenticated, isAdmin]);

  // Fetch discounts when discounts tab is active
  useEffect(() => {
    if (activeTab === 'discounts' && isAuthenticated && isAdmin) {
      fetchDiscounts();
    }
  }, [activeTab, isAuthenticated, isAdmin]);

  // Refetch orders when status filter changes
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchOrders(1, selectedStatus);
    }
  }, [selectedStatus, isAuthenticated, isAdmin]);

  // Refetch revenue data when date range or status changes
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchRevenueData();
    }
  }, [dateRange, selectedStatus, isAuthenticated, isAdmin]);

  // Fetch customers when customers tab is active
  useEffect(() => {
    if (isAuthenticated && isAdmin && activeTab === 'customers') {
      fetchCustomers();
    }
  }, [isAuthenticated, isAdmin, activeTab]);

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    if (isAuthenticated && isAdmin && activeTab === 'reviews') {
      fetchReviews();
    }
  }, [isAuthenticated, isAdmin, activeTab]);

  // Fetch categories when categories tab is active
  useEffect(() => {
    if (isAuthenticated && isAdmin && activeTab === 'categories') {
      fetchCategories();
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
        trending: productForm.trending,
        washDetails: productForm.washDetails
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
        trending: false,
        washDetails: {
          washing: '',
          drying: '',
          ironing: '',
          bleaching: '',
          dryCleaning: '',
          additionalCare: ''
        }
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
      trending: product.trending || false,
      washDetails: product.washDetails || {
        washing: '',
        drying: '',
        ironing: '',
        bleaching: '',
        dryCleaning: '',
        additionalCare: ''
      }
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
          trending: productForm.trending,
          washDetails: productForm.washDetails
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
          trending: false,
          washDetails: {
            washing: '',
            drying: '',
            ironing: '',
            bleaching: '',
            dryCleaning: '',
            additionalCare: ''
          }
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

  // Content Management Functions
  const handleAnnouncementChange = (field, value) => {
    console.log(`Updating announcement ${field}:`, value);
    setContentData(prev => ({
      ...prev,
      announcement: {
        ...prev.announcement,
        [field]: value
      }
    }));
  };

  const handleHeroSlideChange = (slideIndex, field, value) => {
    setContentData(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.map((slide, index) => 
        index === slideIndex 
          ? { ...slide, [field]: value }
          : slide
      )
    }));
  };

  const addHeroSlide = () => {
    const newSlide = {
      title: '',
      description: '',
      ctaText: '',
      ctaLink: '',
      image: '',
      imagePreview: ''
    };
    setContentData(prev => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide]
    }));
  };

  const removeHeroSlide = (slideIndex) => {
    setContentData(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((slide, index) => index !== slideIndex)
    }));
  };

  const handlePromotionalBannerChange = (field, value) => {
    setContentData(prev => ({
      ...prev,
      promotionalBanner: {
        ...prev.promotionalBanner,
        [field]: value
      }
    }));
  };

  const handleStaticPageChange = (pageIndex, field, value) => {
    setContentData(prev => ({
      ...prev,
      staticPages: prev.staticPages.map((page, index) => 
        index === pageIndex 
          ? { ...page, [field]: value }
          : page
      )
    }));
  };

  const addStaticPage = () => {
    const newPage = {
      title: '',
      slug: '',
      content: '',
      published: false
    };
    setContentData(prev => ({
      ...prev,
      staticPages: [...prev.staticPages, newPage]
    }));
  };

  const removeStaticPage = (pageIndex) => {
    setContentData(prev => ({
      ...prev,
      staticPages: prev.staticPages.filter((page, index) => index !== pageIndex)
    }));
  };

  const saveContent = async () => {
    try {
      console.log('Save Content button clicked!');
      console.log('Current content data:', contentData);
      
      // Clean the data before sending - remove client-side IDs
      const cleanContentData = {
        ...contentData,
        heroSlides: contentData.heroSlides.map(slide => {
          const { id, ...cleanSlide } = slide;
          return cleanSlide;
        }),
        staticPages: contentData.staticPages.map(page => {
          const { id, ...cleanPage } = page;
          return cleanPage;
        })
      };
      
      console.log('Cleaned content data:', cleanContentData);
      
      const response = await api.put('/api/content', cleanContentData);
      console.log('Content saved successfully:', response.data);
      
      // Update local state with the saved data
      setContentData(response.data.content);
      
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    }
  };

  // Settings Management Functions
  const handleSettingsChange = (section, field, value) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAdminUserChange = (userId, field, value) => {
    setSettingsData(prev => ({
      ...prev,
      admin: {
        ...prev.admin,
        users: prev.admin.users.map(user => 
          user.id === userId 
            ? { ...user, [field]: value }
            : user
        )
      }
    }));
  };

  const addAdminUser = () => {
    const newUser = {
      id: `user_${Date.now()}`,
      name: '',
      email: '',
      role: 'Editor'
    };
    setSettingsData(prev => ({
      ...prev,
      admin: {
        ...prev.admin,
        users: [...prev.admin.users, newUser]
      }
    }));
  };

  const removeAdminUser = (userId) => {
    setSettingsData(prev => ({
      ...prev,
      admin: {
        ...prev.admin,
        users: prev.admin.users.filter(user => user.id !== userId)
      }
    }));
  };

  const saveSettings = async (section) => {
    try {
      console.log(`🔄 Saving ${section} settings...`);
      console.log(`📤 Data being sent:`, settingsData[section]);
      
      // Save to backend and update context
      const result = await updateSettings(section, settingsData[section]);
      
      if (result.success) {
        console.log(`✅ ${section} settings saved successfully!`);
        alert(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error(`❌ Error saving ${section} settings:`, error);
      alert(`Error saving ${section} settings. Please try again.`);
    }
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
    if (!categoryForm.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    if (!categoryForm.description.trim()) {
      alert('Category description is required');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name.trim());
      formData.append('description', categoryForm.description.trim());
      formData.append('isActive', categoryForm.status === 'active');
      
      if (categoryForm.parentCategory) {
        formData.append('parentCategory', categoryForm.parentCategory);
      }
      
      if (categoryForm.image) {
        formData.append('image', categoryForm.image);
      }

      const response = await api.post('/api/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh categories instead of manually updating state
      await fetchCategories();
      setCategoryForm({ name: '', description: '', image: '', imagePreview: '', status: 'active', parentCategory: null });
      setShowAddCategory(false);
      alert('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category. Please try again.');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryForm.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    if (!categoryForm.description.trim()) {
      alert('Category description is required');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name.trim());
      formData.append('description', categoryForm.description.trim());
      formData.append('isActive', categoryForm.status === 'active');
      
      if (categoryForm.parentCategory) {
        formData.append('parentCategory', categoryForm.parentCategory);
      }
      
      if (categoryForm.image) {
        formData.append('image', categoryForm.image);
      }

      const response = await api.put(`/api/categories/${editingCategory._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh categories instead of manually updating state
      await fetchCategories();
      
      setCategoryForm({ name: '', description: '', image: '', imagePreview: '', status: 'active', parentCategory: null });
      setShowEditCategory(false);
      setEditingCategory(null);
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    }
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      image: '',
      imagePreview: category.image || '',
      status: category.isActive ? 'active' : 'inactive',
      parentCategory: category.parentCategory?._id || null
    });
    setShowEditCategory(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryForm({
        ...categoryForm,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const clearCategoryForm = () => {
    setCategoryForm({ name: '', description: '', image: '', imagePreview: '', status: 'active', parentCategory: null });
    setEditingCategory(null);
  };

  // Category filtering and search
  const getFilteredCategories = () => {
    let filtered = [...categories];
    
    // Search filter
    if (categorySearch.trim()) {
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(categorySearch.toLowerCase()))
      );
    }
    
    // Status filter
    if (categoryStatusFilter !== 'all') {
      filtered = filtered.filter(cat => 
        categoryStatusFilter === 'active' ? cat.isActive : !cat.isActive
      );
    }
    
    // Type filter
    if (categoryTypeFilter !== 'all') {
      filtered = filtered.filter(cat => 
        categoryTypeFilter === 'main' ? !cat.parentCategory : cat.parentCategory
      );
    }
    
    return filtered;
  };

  const handleCategorySearch = (e) => {
    setCategorySearch(e.target.value);
  };

  const handleCategoryStatusFilter = (e) => {
    setCategoryStatusFilter(e.target.value);
  };

  const handleCategoryTypeFilter = (e) => {
    setCategoryTypeFilter(e.target.value);
  };

  const clearCategoryFilters = () => {
    setCategorySearch('');
    setCategoryStatusFilter('all');
    setCategoryTypeFilter('all');
  };



  // Function to create all predefined categories
  const createAllPredefinedCategories = async () => {
    try {
      console.log('Creating all predefined categories...');
      
      const allCategories = [
        {
          name: "Electronics",
          description: "Electronic devices and gadgets",
          subCategories: [
            "Smartphones", "Laptops", "Tablets", "Headphones", "Speakers", "Cameras", "Gaming Consoles"
          ]
        },
        {
          name: "Apparel",
          description: "Clothing, shoes, and fashion accessories",
          subCategories: [
            "Men's Clothing", "Women's Clothing", "Kids' Clothing", "Shoes", "Bags", "Jewelry", "Watches"
          ]
        },
        {
          name: "DIY and Hardware",
          description: "Do-it-yourself and hardware tools",
          subCategories: [
            "Power Tools", "Hand Tools", "Garden Tools", "Building Materials", "Paint", "Electrical"
          ]
        },
        {
          name: "Health, Personal Care, and Beauty",
          description: "Health and beauty products",
          subCategories: [
            "Skincare", "Makeup", "Hair Care", "Personal Care", "Vitamins", "Fitness"
          ]
        },
        {
          name: "Furniture and Home Décor",
          description: "Furniture and home decoration items",
          subCategories: [
            "Living Room", "Bedroom", "Kitchen", "Bathroom", "Outdoor", "Lighting", "Decor"
          ]
        },
        {
          name: "Media",
          description: "Books, movies, music, and digital media",
          subCategories: [
            "Books", "Movies", "Music", "Magazines", "Digital Downloads", "Audiobooks"
          ]
        },
        {
          name: "Toys and Hobbies",
          description: "Toys, games, and hobby supplies",
          subCategories: [
            "Outdoor Toys",
            "Board Games & Puzzles",
            "Arts & Crafts Supplies"
          ]
        }
      ];
      
      // Get existing categories
      const existingCategories = await api.get('/api/categories/admin/all');
      const existingCategoryNames = existingCategories.data.map(cat => cat.name);
      
      let totalCreated = 0;
      
      // Create main categories
      for (const category of allCategories) {
        if (!existingCategoryNames.includes(category.name)) {
          const categoryData = {
            name: category.name,
            description: category.description,
            isActive: true,
            image: '/accessories.png',
            slug: category.name.toLowerCase().replace(/\s+/g, '-')
          };
          
          try {
            const response = await api.post('/api/categories', categoryData);
            console.log(`Created main category: ${category.name}`);
            totalCreated++;
            
            // Create sub-categories
            for (const subCatName of category.subCategories) {
              const subCategoryData = {
                name: subCatName,
                description: `${subCatName} under ${category.name}`,
                isActive: true,
                image: '/accessories.png',
                parentCategory: response.data._id,
                slug: subCatName.toLowerCase().replace(/\s+/g, '-')
              };
              
              try {
                await api.post('/api/categories', subCategoryData);
                console.log(`Created sub-category: ${subCatName}`);
                totalCreated++;
              } catch (error) {
                console.error(`Error creating sub-category ${subCatName}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error creating main category ${category.name}:`, error);
          }
        }
      }
      
      // Refresh categories
      await fetchCategories();
      
      if (totalCreated > 0) {
        alert(`Successfully created ${totalCreated} categories and sub-categories!`);
      } else {
        alert('All predefined categories already exist!');
      }
      
    } catch (error) {
      console.error('Error creating predefined categories:', error);
      alert('Error creating predefined categories. Please try again.');
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
        { name: "Men's Clothing", parentCategory: 'Apparel', description: 'Clothing specifically designed for men' },
        
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
      await fetchCategories();
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
      // Refresh categories instead of manually updating state
      await fetchCategories();
      // Also refresh products to update category references
      await fetchData();
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
    "Apparel": [
      "Women's Clothing",
      "Men's Clothing", 
      "Shoes",
      "Accessories",
      "Kids & Baby Clothing"
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

      {/* Recent Orders */}
      <div className="recent-orders">
        <div className="section-header">
          <h3>Recent Orders</h3>
          <div className="header-actions">
            <div className="filter-dropdowns">
              <select 
                className="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map(order => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{new Date(order.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
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
          <div className="header-actions">
            <div className="filter-dropdowns">
              <div className="filter-section">
                <label className="filter-label">Filter by Status:</label>
                <select 
                  className="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">All Revenue</option>
                  <option value="Pending">Pending Revenue</option>
                  <option value="Processing">Processing Revenue</option>
                  <option value="Shipped">Shipped Revenue</option>
                  <option value="Delivered">Delivered Revenue</option>
                </select>
              </div>
              
                              <div className="filter-section">
                  <label className="filter-label">Filter by Date Range:</label>
                  <div className="date-filters">
                    <input
                      type="date"
                      className="date-input"
                      value={dateRange.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      placeholder="Start Date"
                      title="Select Start Date"
                    />
                    <span className="date-separator">to</span>
                    <input
                      type="date"
                      className="date-input"
                      value={dateRange.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      placeholder="End Date"
                      title="Select End Date"
                    />
                    <button 
                      className="clear-filters-btn"
                      onClick={() => setDateRange({ startDate: '', endDate: '' })}
                      title="Clear Date Filters"
                    >
                      Clear
                    </button>
                  </div>
                </div>
            </div>
            <button className="export-btn" onClick={handleExportOrders}>
              <FiDownload /> Export Revenue
            </button>
          </div>
        </div>
        
        <div className="revenue-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <FiDollarSign />
            </div>
            <div className="summary-content">
              <div className="summary-value">₹{orderStats.totalRevenue?.toLocaleString() || 0}</div>
              <div className="summary-label">Total Revenue</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <FiShoppingCart />
            </div>
            <div className="summary-content">
              <div className="summary-value">{orderStats.totalOrders || 0}</div>
              <div className="summary-label">Total Orders</div>
            </div>
          </div>
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

            {/* Wash Details Section */}
            <div className="form-section">
              <h4>Wash & Care Instructions</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Washing Instructions</label>
                  <textarea
                    className="form-textarea"
                    value={productForm.washDetails?.washing || ''}
                    onChange={(e) => setProductForm({
                      ...productForm, 
                      washDetails: {
                        ...productForm.washDetails,
                        washing: e.target.value
                      }
                    })}
                    placeholder="Enter washing instructions (e.g., Machine wash cold, gentle cycle)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Drying Instructions</label>
                  <textarea
                    className="form-textarea"
                    value={productForm.washDetails?.drying || ''}
                    onChange={(e) => setProductForm({
                      ...productForm, 
                      washDetails: {
                        ...productForm.washDetails,
                        drying: e.target.value
                      }
                    })}
                    placeholder="Enter drying instructions (e.g., Tumble dry low, line dry)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Ironing Instructions</label>
                  <textarea
                    className="form-textarea"
                    value={productForm.washDetails?.ironing || ''}
                    onChange={(e) => setProductForm({
                      ...productForm, 
                      washDetails: {
                        ...productForm.washDetails,
                        ironing: e.target.value
                      }
                    })}
                    placeholder="Enter ironing instructions (e.g., Iron on low heat, steam iron)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Bleaching Instructions</label>
                  <textarea
                    className="form-textarea"
                    value={productForm.washDetails?.bleaching || ''}
                    onChange={(e) => setProductForm({
                      ...productForm, 
                      washDetails: {
                        ...productForm.washDetails,
                        bleaching: e.target.value
                      }
                    })}
                    placeholder="Enter bleaching instructions (e.g., Do not bleach, bleach as needed)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Dry Cleaning Instructions</label>
                  <textarea
                    className="form-textarea"
                    value={productForm.washDetails?.dryCleaning || ''}
                    onChange={(e) => setProductForm({
                      ...productForm, 
                      washDetails: {
                        ...productForm.washDetails,
                        dryCleaning: e.target.value
                      }
                    })}
                    placeholder="Enter dry cleaning instructions (e.g., Dry clean only, dry clean as needed)"
                  />
                </div>
                
                <div className="form-group">
                  <label>Additional Care Tips</label>
                  <textarea
                    className="form-textarea"
                    value={productForm.washDetails?.additionalCare || ''}
                    onChange={(e) => setProductForm({
                      ...productForm, 
                      washDetails: {
                        ...productForm.washDetails,
                        additionalCare: e.target.value
                      }
                    })}
                    placeholder="Enter any additional care tips or special instructions"
                  />
                </div>
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
                  trending: false,
                  washDetails: {
                    washing: '',
                    drying: '',
                    ironing: '',
                    bleaching: '',
                    dryCleaning: '',
                    additionalCare: ''
                  }
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
          <button className="migrate-btn" onClick={handleMigrateOrders}>
            <FiUpload /> Migrate Orders
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
                    <td>{new Date(order.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-orders">No Orders</option>
          </select>
          </div>
          <button className="migrate-btn" onClick={handleMigrateUsers}>
            <FiUpload /> Migrate Users
          </button>
        </div>
      </div>
      
      {/* Customer Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{customerStats.totalCustomers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Customers with Orders</h3>
          <p>{customerStats.customersWithOrders || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p>{customerStats.pendingOrders || 0}</p>
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
                      <span className={`status-badge ${getStatusClass(customer.lastOrderStatus || 'No Orders')}`}>
                        {customer.lastOrderStatus || 'No Orders'}
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
                          className={`action-btn ${getStatusClass(customer.lastOrderStatus || 'No Orders')}`}
                          onClick={() => {
                            const action = getStatusClass(customer.lastOrderStatus || 'No Orders') === 'blocked' ? 'unblock' : 'block';
                            const reason = getStatusClass(customer.lastOrderStatus || 'No Orders') === 'blocked' ? '' : prompt('Reason for blocking:');
                            handleCustomerStatusChange(customer._id, getStatusClass(customer.lastOrderStatus || 'No Orders') === 'blocked', reason);
                          }}
                          title={getStatusClass(customer.lastOrderStatus || 'No Orders') === 'blocked' ? 'Unblock Customer' : 'Block Customer'}
                        >
                          {getStatusClass(customer.lastOrderStatus || 'No Orders') === 'blocked' ? 'Unblock' : 'Block'}
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
          <div className="search-filter-container">
            <input
              type="text"
              placeholder="Search reviews..."
              value={reviewSearch}
              onChange={(e) => handleReviewSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={reviewStatusFilter}
              onChange={(e) => handleReviewStatusFilterChange(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button className="migrate-btn" onClick={handleMigrateReviews}>
            <FiUpload /> Migrate Reviews
          </button>
        </div>
      </div>

      {/* Review Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Reviews</h3>
          <p>{reviewStats.totalReviews || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Reviews</h3>
          <p>{reviewStats.pendingReviews || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Approved Reviews</h3>
          <p>{reviewStats.approvedReviews || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p>{reviewStats.averageRating ? reviewStats.averageRating.toFixed(1) : '0.0'}</p>
        </div>
      </div>

      {/* Reviews Table */}
      {reviewsLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="no-data">
          <p>No reviews found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th>Admin Reply</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id}>
                    <td>
                      <div className="product-info">
                        <img 
                          src={review.product?.image || '/placeholder.png'} 
                          alt={review.product?.name || 'Product'} 
                          className="product-thumbnail"
                        />
                        <span>{review.product?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{review.name}</span>
                        <span className="customer-email">{review.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="rating-display">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star ${i < review.rating ? 'filled' : 'empty'}`}>
                            ★
                          </span>
                        ))}
                        <span className="rating-number">({review.rating})</span>
                      </div>
                    </td>
                    <td>
                      <div className="review-comment">
                        {review.comment}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${review.status}`}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="admin-reply">
                        {review.adminReply ? (
                          <div className="reply-content">
                            <p>{review.adminReply}</p>
                            <small>{new Date(review.adminReplyDate).toLocaleDateString()}</small>
                          </div>
                        ) : (
                          <span className="no-reply">No reply yet</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn reply"
                          onClick={() => openReplyModal(review)}
                          title="Reply to Review"
                        >
                          <FiMessageSquare />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteReview(review._id)}
                          title="Delete Review"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {reviewsPagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => fetchReviews(reviewsPagination.currentPage - 1, reviewStatusFilter, reviewSearch)}
                disabled={!reviewsPagination.hasPrevPage}
              >
                ‹ Prev
              </button>
              <div className="page-info">
                Page {reviewsPagination.currentPage} of {reviewsPagination.totalPages}
              </div>
              <button
                className="page-btn"
                onClick={() => fetchReviews(reviewsPagination.currentPage + 1, reviewStatusFilter, reviewSearch)}
                disabled={!reviewsPagination.hasNextPage}
              >
                Next ›
              </button>
            </div>
          )}
        </>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reply to Review</h3>
              <button className="modal-close" onClick={() => setShowReplyModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="review-summary">
                <h4>Review by {selectedReview?.name}</h4>
                <p><strong>Rating:</strong> {selectedReview?.rating}/5</p>
                <p><strong>Comment:</strong> {selectedReview?.comment}</p>
              </div>
              <div className="form-group">
                <label>Your Reply:</label>
                <textarea
                  className="form-input"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter your reply to this review..."
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-primary" 
                onClick={handleReply}
                disabled={replyLoading || !replyText.trim()}
              >
                {replyLoading ? 'Sending...' : 'Send Reply'}
              </button>
              <button className="btn-secondary" onClick={() => setShowReplyModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="admin-categories">
      <div className="section-header">
        <h1>Categories</h1>
                  <div className="header-actions">
            <button className="add-btn" onClick={() => setShowAddCategory(true)}>
              <FiPlus /> Add Category
            </button>
          </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={handleCategorySearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-section">
          <select
            value={categoryStatusFilter}
            onChange={handleCategoryStatusFilter}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={categoryTypeFilter}
            onChange={handleCategoryTypeFilter}
            className="status-filter"
          >
            <option value="all">All Types</option>
            <option value="main">Main Categories</option>
            <option value="sub">Sub Categories</option>
          </select>
          
          <button className="clear-filters-btn" onClick={clearCategoryFilters}>
            Clear Filters
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
            
            <div className="form-group">
              <label>Category Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
              {categoryForm.imagePreview && (
                <div className="image-preview">
                  <img src={categoryForm.imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            <div className="form-actions">
                                           <button className="cancel-btn" onClick={() => {
                setShowAddCategory(false);
                clearCategoryForm();
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

      {/* Edit Category Form */}
      {showEditCategory && (
        <div className="form-modal" onClick={() => setShowEditCategory(false)}>
          <div className="form-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Category</h3>
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
                  .filter(cat => !cat.parentCategory && cat._id !== editingCategory?._id) // Don't allow self as parent
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
                placeholder="Enter category description"
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Category Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input"
              />
              {categoryForm.imagePreview && (
                <div className="form-image-preview">
                  <img src={categoryForm.imagePreview} alt="Preview" />
                </div>
              )}
            </div>
            
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => {
                setShowEditCategory(false);
                clearCategoryForm();
              }}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleEditCategory}>
                Update Category
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
            {Array.isArray(getFilteredCategories()) ? getFilteredCategories()
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
                        <button className="action-btn edit" onClick={() => openEditCategory(mainCategory)}><FiEdit /></button>
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
                            <button className="action-btn edit" onClick={() => openEditCategory(subCategory)}><FiEdit /></button>
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
        <button className="add-btn" onClick={() => setShowAddDiscount(true)}>
          <FiPlus /> Add Discount
        </button>
      </div>
      
      {discountsLoading ? (
        <div className="loading-spinner">Loading discounts...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Max Uses</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.length > 0 ? (
                discounts.map((discount) => (
                  <tr key={discount._id}>
                    <td><strong>{discount.code}</strong></td>
                    <td>{discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</td>
                    <td>
                      {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                    </td>
                    <td>₹{discount.minOrderAmount || '0'}</td>
                    <td>{discount.maxUses || 'Unlimited'}</td>
                    <td>{discount.validUntil ? new Date(discount.validUntil).toLocaleDateString() : 'No expiry'}</td>
                    <td>
                      <span className={`status-badge ${discount.isActive ? 'active' : 'inactive'}`}>
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        className="action-btn edit" 
                        onClick={() => openEditDiscount(discount)}
                        title="Edit Discount"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDeleteDiscount(discount._id)}
                        title="Delete Discount"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    No discounts found. Create your first discount code!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Discount Modal */}
      {showAddDiscount && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Discount</h2>
              <button className="close-btn" onClick={() => setShowAddDiscount(false)}>×</button>
            </div>
            <form onSubmit={handleAddDiscount} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Code *</label>
                  <input
                    type="text"
                    value={discountForm.code}
                    onChange={(e) => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., SALE20"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={discountForm.type}
                    onChange={(e) => setDiscountForm({...discountForm, type: e.target.value})}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Value *</label>
                  <input
                    type="number"
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({...discountForm, value: e.target.value})}
                    placeholder={discountForm.type === 'percentage' ? '20' : '100'}
                    min="0"
                    max={discountForm.type === 'percentage' ? '100' : '9999'}
                    required
                  />
                  <span className="input-suffix">
                    {discountForm.type === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
                <div className="form-group">
                  <label>Minimum Order Amount</label>
                  <input
                    type="number"
                    value={discountForm.minOrderAmount}
                    onChange={(e) => setDiscountForm({...discountForm, minOrderAmount: e.target.value})}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Maximum Discount</label>
                  <input
                    type="number"
                    value={discountForm.maxDiscount}
                    onChange={(e) => setDiscountForm({...discountForm, maxDiscount: e.target.value})}
                    placeholder="No limit"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Uses</label>
                  <input
                    type="number"
                    value={discountForm.maxUses}
                    onChange={(e) => setDiscountForm({...discountForm, maxUses: e.target.value})}
                    placeholder="Unlimited"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valid From</label>
                  <input
                    type="date"
                    value={discountForm.validFrom}
                    onChange={(e) => setDiscountForm({...discountForm, validFrom: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={discountForm.validUntil}
                    onChange={(e) => setDiscountForm({...discountForm, validUntil: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                  placeholder="Optional description for this discount"
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={discountForm.isActive}
                    onChange={(e) => setDiscountForm({...discountForm, isActive: e.target.checked})}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddDiscount(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Discount Modal */}
      {showEditDiscount && editingDiscount && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Discount</h2>
              <button className="close-btn" onClick={() => setShowEditDiscount(false)}>×</button>
            </div>
            <form onSubmit={handleEditDiscount} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Code *</label>
                  <input
                    type="text"
                    value={discountForm.code}
                    onChange={(e) => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., SALE20"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={discountForm.type}
                    onChange={(e) => setDiscountForm({...discountForm, type: e.target.value})}
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Value *</label>
                  <input
                    type="number"
                    value={discountForm.value}
                    onChange={(e) => setDiscountForm({...discountForm, value: e.target.value})}
                    placeholder={discountForm.type === 'percentage' ? '20' : '100'}
                    min="0"
                    max={discountForm.type === 'percentage' ? '100' : '9999'}
                    required
                  />
                  <span className="input-suffix">
                    {discountForm.type === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
                <div className="form-group">
                  <label>Minimum Order Amount</label>
                  <input
                    type="number"
                    value={discountForm.minOrderAmount}
                    onChange={(e) => setDiscountForm({...discountForm, minOrderAmount: e.target.value})}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Maximum Discount</label>
                  <input
                    type="number"
                    value={discountForm.maxDiscount}
                    onChange={(e) => setDiscountForm({...discountForm, maxDiscount: e.target.value})}
                    placeholder="No limit"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Uses</label>
                  <input
                    type="number"
                    value={discountForm.maxUses}
                    onChange={(e) => setDiscountForm({...discountForm, maxUses: e.target.value})}
                    placeholder="Unlimited"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valid From</label>
                  <input
                    type="date"
                    value={discountForm.validFrom}
                    onChange={(e) => setDiscountForm({...discountForm, validFrom: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={discountForm.validUntil}
                    onChange={(e) => setDiscountForm({...discountForm, validUntil: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={discountForm.description}
                  onChange={(e) => setDiscountForm({...discountForm, description: e.target.value})}
                  placeholder="Optional description for this discount"
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={discountForm.isActive}
                    onChange={(e) => setDiscountForm({...discountForm, isActive: e.target.checked})}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditDiscount(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderContentManager = () => (
    <div className="admin-content">
      <h1>Content Manager</h1>
      

      
      {/* Top Bar Announcement */}
      <div className="content-section">
        <h3>Top Bar Announcement</h3>
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={contentData.announcement.enabled}
              onChange={(e) => handleAnnouncementChange('enabled', e.target.checked)}
            />
            Enable Announcement
          </label>
        </div>
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Announcement Text" 
            className="form-input"
            value={contentData.announcement.text || ''}
            onChange={(e) => handleAnnouncementChange('text', e.target.value)}
          />
        </div>
        
        {/* Link Type Selection */}
        <div className="form-group">
          <label>Link Type:</label>
          <select 
            className="form-select"
            value={contentData.announcement.linkType}
            onChange={(e) => handleAnnouncementChange('linkType', e.target.value)}
          >
            <option value="none">No Link</option>
            <option value="internal">Internal Page</option>
            <option value="external">External URL</option>
          </select>
        </div>

        {/* Button Text */}
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Button Text (e.g., Learn More, Shop Now, Read More)" 
            className="form-input"
            value={contentData.announcement.buttonText || 'Learn More'}
            onChange={(e) => handleAnnouncementChange('buttonText', e.target.value)}
          />
        </div>

        {/* Target Page Selection (for internal links) */}
        {contentData.announcement.linkType === 'internal' && (
          <div className="form-group">
            <label>Target Page:</label>
            <select 
              className="form-select"
              value={contentData.announcement.targetPage}
              onChange={(e) => handleAnnouncementChange('targetPage', e.target.value)}
            >
              <option value="">Select a page</option>
              <option value="/">Home</option>
              <option value="/products">Products</option>
              <option value="/new-arrivals">New Arrivals</option>
              <option value="/about">About Us</option>
              <option value="/contact">Contact Us</option>
              <option value="/cart">Cart</option>
            </select>
          </div>
        )}

        {/* External URL (for external links) */}
        {contentData.announcement.linkType === 'external' && (
          <div className="form-group">
            <input 
              type="url" 
              placeholder="External URL (e.g., https://example.com)" 
              className="form-input"
              value={contentData.announcement.link}
              onChange={(e) => handleAnnouncementChange('link', e.target.value)}
            />
          </div>
        )}

        <button 
          className="save-btn" 
          onClick={() => saveContent()}
        >
          Save Announcement
        </button>
      </div>

      {/* Hero Slider */}
      <div className="content-section">
        <h3>Hero Slider</h3>
        {contentData.heroSlides.map((slide, index) => (
          <div key={index} className="slide-item">
            <h4>Slide {index + 1}</h4>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Title" 
                className="form-input"
                value={slide.title}
                onChange={(e) => handleHeroSlideChange(index, 'title', e.target.value)}
              />
            </div>
            <div className="form-group">
              <textarea 
                placeholder="Description" 
                className="form-textarea"
                value={slide.description || ''}
                onChange={(e) => handleHeroSlideChange(index, 'description', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="CTA Text" 
                className="form-input"
                value={slide.ctaText}
                onChange={(e) => handleHeroSlideChange(index, 'ctaText', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="CTA Link" 
                className="form-input"
                value={slide.ctaLink}
                onChange={(e) => handleHeroSlideChange(index, 'ctaLink', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input 
                type="file" 
                className="form-input"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => handleHeroSlideChange(index, 'imagePreview', e.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <label>Background Image</label>
              {slide.imagePreview && (
                <div className="image-preview">
                  <img src={slide.imagePreview} alt="Slide preview" />
                </div>
              )}
            </div>
            {contentData.heroSlides.length > 1 && (
              <button 
                className="remove-btn" 
                onClick={() => removeHeroSlide(index)}
              >
                Remove Slide
              </button>
            )}
          </div>
        ))}
        <div className="form-actions">
          <button className="add-btn" onClick={addHeroSlide}><FiPlus /> Add Slide</button>
          <button className="save-btn" onClick={() => saveContent()}>Save Slider Settings</button>
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
          <label>
            <input 
              type="checkbox" 
              checked={contentData.promotionalBanner.enabled}
              onChange={(e) => handlePromotionalBannerChange('enabled', e.target.checked)}
            />
            Enable Banner
          </label>
        </div>
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Title" 
            className="form-input"
            value={contentData.promotionalBanner.title}
            onChange={(e) => handlePromotionalBannerChange('title', e.target.value)}
          />
        </div>
        <div className="form-group">
          <input 
            type="text" 
            placeholder="CTA Text" 
            className="form-input"
            value={contentData.promotionalBanner.ctaText}
            onChange={(e) => handlePromotionalBannerChange('ctaText', e.target.value)}
          />
        </div>
        <button className="save-btn" onClick={() => saveContent()}>Save Banner</button>
      </div>

      {/* Static Pages */}
      <div className="content-section">
        <h3>Static Pages</h3>
        <button className="add-btn" onClick={addStaticPage}><FiPlus /> Add New Page</button>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contentData.staticPages.map((page, index) => (
                <tr key={index}>
                  <td>
                    <input 
                      type="text" 
                      className="form-input inline-input"
                      value={page.title}
                      onChange={(e) => handleStaticPageChange(index, 'title', e.target.value)}
                      placeholder="Page Title"
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="form-input inline-input"
                      value={page.slug}
                      onChange={(e) => handleStaticPageChange(index, 'slug', e.target.value)}
                      placeholder="page-slug"
                    />
                  </td>
                  <td>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={page.published}
                        onChange={(e) => handleStaticPageChange(index, 'published', e.target.checked)}
                      />
                      Published
                    </label>
                  </td>
                  <td className="actions">
                    <button className="action-btn edit"><FiEdit /></button>
                    <button 
                      className="action-btn delete"
                      onClick={() => removeStaticPage(index)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="save-btn" onClick={() => saveContent()}>Save Pages</button>
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
            <input 
              type="text" 
              className="form-input" 
              value={settingsData.general.storeName}
              onChange={(e) => handleSettingsChange('general', 'storeName', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Contact Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={settingsData.general.contactEmail}
              onChange={(e) => handleSettingsChange('general', 'contactEmail', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              className="form-input" 
              value={settingsData.general.phoneNumber}
              onChange={(e) => handleSettingsChange('general', 'phoneNumber', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Store Logo</label>
            <input 
              type="file" 
              className="form-input"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => handleSettingsChange('general', 'logoPreview', e.target.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
            {settingsData.general.logoPreview && (
              <div className="image-preview">
                <img src={settingsData.general.logoPreview} alt="Logo preview" />
              </div>
            )}
          </div>
          <button className="save-btn" onClick={() => saveSettings('general')}>Save General Settings</button>
        </div>
      )}

             {settingsTab === 'store' && (
         <div className="settings-content">
           <h3>Store Settings</h3>
          <div className="form-group">
            <label>Business Address</label>
            <textarea 
              className="form-textarea" 
              value={settingsData.store.businessAddress}
              onChange={(e) => handleSettingsChange('store', 'businessAddress', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Tax Rate (%)</label>
            <input 
              type="number" 
              className="form-input" 
              value={settingsData.store.taxRate}
              onChange={(e) => handleSettingsChange('store', 'taxRate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select 
              className="form-input"
              value={settingsData.store.currency}
              onChange={(e) => handleSettingsChange('store', 'currency', e.target.value)}
            >
              <option value="₹">₹ (INR)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select 
              className="form-input"
              value={settingsData.store.timezone}
              onChange={(e) => handleSettingsChange('store', 'timezone', e.target.value)}
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
          <button className="save-btn" onClick={() => saveSettings('store')}>Save Store Settings</button>
        </div>
      )}

             {settingsTab === 'shipping' && (
         <div className="settings-content">
           <h3>Shipping Cost Settings</h3>
          <div className="form-group">
            <label>Free Shipping Threshold ({settingsData.store.currency})</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="Orders above this amount will have free shipping"
              value={settingsData.shipping.freeShippingThreshold}
              onChange={(e) => handleSettingsChange('shipping', 'freeShippingThreshold', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Default Shipping Cost ({settingsData.store.currency})</label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="Default shipping cost for orders below threshold"
              value={settingsData.shipping.defaultShippingCost}
              onChange={(e) => handleSettingsChange('shipping', 'defaultShippingCost', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settingsData.shipping.forcePaidShipping}
                onChange={(e) => handleSettingsChange('shipping', 'forcePaidShipping', e.target.checked)}
              />
              Force Paid Shipping
            </label>
            <small>If enabled, free shipping threshold will be ignored.</small>
          </div>
          <button className="save-btn" onClick={() => saveSettings('shipping')}>Save Shipping Settings</button>
        </div>
      )}

             {settingsTab === 'payment' && (
         <div className="settings-content">
           <h3>Payment Gateways</h3>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settingsData.payment.razorpay}
                onChange={(e) => handleSettingsChange('payment', 'razorpay', e.target.checked)}
              />
              Enable Razorpay
            </label>
            <small>Secure online payments via Razorpay gateway</small>
          </div>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settingsData.payment.cod}
                onChange={(e) => handleSettingsChange('payment', 'cod', e.target.checked)}
              />
              Enable Cash on Delivery (COD)
            </label>
            <small>Allow customers to pay when they receive their order</small>
          </div>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settingsData.payment.cashfree}
                onChange={(e) => handleSettingsChange('payment', 'cashfree', e.target.checked)}
              />
              Enable Cashfree
            </label>
            <small>Alternative payment gateway for online transactions</small>
          </div>
          <div className="form-group">
            <label>Test Mode</label>
            <label>
              <input 
                type="checkbox" 
                defaultChecked
              />
              Enable Test Mode
            </label>
            <small>Use test credentials for development and testing</small>
          </div>
          <button className="save-btn" onClick={() => saveSettings('payment')}>Save Payment Settings</button>
        </div>
      )}

             {settingsTab === 'email' && (
         <div className="settings-content">
           <h3>Email Notifications</h3>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settingsData.email.orderConfirmation}
                onChange={(e) => handleSettingsChange('email', 'orderConfirmation', e.target.checked)}
              />
              Send Order Confirmation to Customer
            </label>
            <small>Automatically send confirmation emails when orders are placed</small>
          </div>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settingsData.email.adminNotification}
                onChange={(e) => handleSettingsChange('email', 'adminNotification', e.target.checked)}
              />
              Notify Admin on New Order
            </label>
            <small>Send notification emails to admin when new orders arrive</small>
          </div>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={settingsData.email.shippingUpdates}
                onChange={(e) => handleSettingsChange('email', 'shippingUpdates', e.target.checked)}
              />
              Enable Shipping Updates
            </label>
            <small>Send shipping status updates to customers</small>
          </div>
          <div className="form-group">
            <label>SMTP Settings</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="SMTP Host (e.g., smtp.gmail.com)"
              value={settingsData.email.smtpHost}
              onChange={(e) => handleSettingsChange('email', 'smtpHost', e.target.value)}
            />
            <input 
              type="text" 
              className="form-input" 
              placeholder="SMTP Port (e.g., 587)"
              value={settingsData.email.smtpPort}
              onChange={(e) => handleSettingsChange('email', 'smtpPort', e.target.value)}
            />
            <input 
              type="email" 
              className="form-input" 
              placeholder="Email Address"
              value={settingsData.email.smtpEmail}
              onChange={(e) => handleSettingsChange('email', 'smtpEmail', e.target.value)}
            />
            <input 
              type="password" 
              className="form-input" 
              placeholder="Email Password/App Password"
              value={settingsData.email.smtpPassword}
              onChange={(e) => handleSettingsChange('email', 'smtpPassword', e.target.value)}
            />
          </div>
          <button className="save-btn" onClick={() => saveSettings('email')}>Save Email Settings</button>
        </div>
      )}

             {settingsTab === 'appearance' && (
         <div className="settings-content">
           <h3>Appearance & Theme</h3>
          <div className="form-group">
            <label>Primary Color</label>
            <input 
              type="color" 
              className="form-input color-input" 
              value={settingsData.appearance.primaryColor}
              onChange={(e) => handleSettingsChange('appearance', 'primaryColor', e.target.value)}
            />
            <small>Main brand color used throughout the site</small>
          </div>
          <div className="form-group">
            <label>Secondary Color</label>
            <input 
              type="color" 
              className="form-input color-input" 
              value={settingsData.appearance.secondaryColor}
              onChange={(e) => handleSettingsChange('appearance', 'secondaryColor', e.target.value)}
            />
            <small>Secondary color for accents and highlights</small>
          </div>
          <div className="form-group">
            <label>Theme Mode</label>
            <select 
              className="form-input"
              value={settingsData.appearance.themeMode}
              onChange={(e) => handleSettingsChange('appearance', 'themeMode', e.target.value)}
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="auto">Auto (Follow System)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Font Family</label>
            <select 
              className="form-input"
              value={settingsData.appearance.fontFamily}
              onChange={(e) => handleSettingsChange('appearance', 'fontFamily', e.target.value)}
            >
              <option value="Inter">Inter (Modern)</option>
              <option value="Roboto">Roboto (Clean)</option>
              <option value="Open Sans">Open Sans (Readable)</option>
              <option value="Poppins">Poppins (Friendly)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Border Radius</label>
            <select 
              className="form-input"
              value={settingsData.appearance.borderRadius}
              onChange={(e) => handleSettingsChange('appearance', 'borderRadius', e.target.value)}
            >
              <option value="0">Sharp (0px)</option>
              <option value="4">Slightly Rounded (4px)</option>
              <option value="8">Rounded (8px)</option>
              <option value="12">Very Rounded (12px)</option>
            </select>
          </div>
          <button className="save-btn" onClick={() => saveSettings('appearance')}>Save Appearance Settings</button>
        </div>
      )}

             {settingsTab === 'admin' && (
         <div className="settings-content">
           <h3>User Role Management</h3>
          <button className="add-btn" onClick={addAdminUser}><FiPlus /> Add User</button>
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
                {settingsData.admin.users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <input 
                        type="text" 
                        className="form-input inline-input"
                        value={user.name}
                        onChange={(e) => handleAdminUserChange(user.id, 'name', e.target.value)}
                        placeholder="User Name"
                      />
                    </td>
                    <td>
                      <input 
                        type="email" 
                        className="form-input inline-input"
                        value={user.email}
                        onChange={(e) => handleAdminUserChange(user.id, 'email', e.target.value)}
                        placeholder="user@example.com"
                      />
                    </td>
                    <td>
                      <select 
                        className="form-input inline-input"
                        value={user.role}
                        onChange={(e) => handleAdminUserChange(user.id, 'role', e.target.value)}
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Editor">Editor</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </td>
                    <td className="actions">
                      <button className="action-btn edit"><FiEdit /></button>
                      {user.role !== 'Super Admin' && (
                        <button 
                          className="action-btn delete"
                          onClick={() => removeAdminUser(user.id)}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="save-btn" onClick={() => saveSettings('admin')}>Save User Settings</button>
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
                  <div className="info-item">
                    <strong>Order Date:</strong> 
                    <span className="order-value">{new Date(orderData.orderDate).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
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
                      {stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'No orders'}
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
                          <td>{new Date(order.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</td>
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
              className={`btn-primary ${getStatusClass(customer.lastOrderStatus || 'No Orders')}`}
              onClick={() => {
                const reason = getStatusClass(customer.lastOrderStatus || 'No Orders') === 'blocked' ? '' : prompt('Reason for blocking:');
                handleCustomerStatusChange(customer._id, getStatusClass(customer.lastOrderStatus || 'No Orders') === 'blocked', reason);
                setShowCustomerModal(false);
              }}
            >
              {getStatusClass(customer.lastOrderStatus || 'No Orders') === 'blocked' ? 'Unblock Customer' : 'Block Customer'}
            </button>
            <button className="btn-secondary" onClick={() => setShowCustomerModal(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };



  // Reply to a review
  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    
    try {
      setReplyLoading(true);
      const response = await api.post(`/api/reviews/admin/${selectedReview._id}/reply`, {
        reply: replyText.trim()
      });
      
      if (response.data.success) {
        alert('Reply added successfully!');
        setShowReplyModal(false);
        setReplyText('');
        setSelectedReview(null);
        // Refresh reviews list
        fetchReviews(reviewsPagination.currentPage, reviewStatusFilter, reviewSearch);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply');
    } finally {
      setReplyLoading(false);
    }
  };

  // Delete a review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/api/reviews/admin/${reviewId}`);
      if (response.data.success) {
        alert('Review deleted successfully!');
        // Refresh reviews list
        fetchReviews(reviewsPagination.currentPage, reviewStatusFilter, reviewSearch);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  // Handle review search
  const handleReviewSearch = (searchTerm) => {
    setReviewSearch(searchTerm);
    fetchReviews(1, reviewStatusFilter, searchTerm);
  };

  // Handle review status filter change
  const handleReviewStatusFilterChange = (newStatus) => {
    setReviewStatusFilter(newStatus);
    fetchReviews(1, newStatus, reviewSearch);
  };

  // Open reply modal
  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setShowReplyModal(true);
  };

  // Migrate existing reviews
  const handleMigrateReviews = async () => {
    if (!window.confirm('This will migrate existing reviews from products to the new review system. Continue?')) {
      return;
    }
    
    try {
      const response = await api.post('/api/reviews/admin/migrate');
      if (response.data.success) {
        alert(`Migration completed! ${response.data.migratedCount} reviews migrated.`);
        // Refresh reviews list
        fetchReviews();
      }
    } catch (error) {
      console.error('Error migrating reviews:', error);
      alert('Failed to migrate reviews');
    }
  };

  // Migrate orders schema
  const handleMigrateOrders = async () => {
    if (!window.confirm('This will migrate existing orders to the new schema with variant support. Continue?')) {
      return;
    }
    
    try {
      const response = await api.post('/api/orders/admin/migrate-schema');
      if (response.data.success) {
        alert(`Migration completed! ${response.data.migratedCount} orders migrated.`);
        // Refresh orders list
        fetchOrders();
      }
    } catch (error) {
      console.error('Error migrating orders:', error);
      alert('Failed to migrate orders');
    }
  };

  // Migrate users schema
  const handleMigrateUsers = async () => {
    if (!window.confirm('This will migrate existing users to the new schema with customer management fields. Continue?')) {
      return;
    }
    
    try {
      const response = await api.post('/api/users/admin/migrate-schema');
      if (response.data.success) {
        alert(`Migration completed! ${response.data.migratedCount} users migrated.`);
        // Refresh customers list
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error migrating users:', error);
      alert('Failed to migrate users');
    }
  };

  // Function to sync categories with products
  const syncCategoriesWithProducts = async () => {
    try {
      console.log('Syncing categories with products...');
      
      // Define all the main categories and their sub-categories
      const allCategories = [
        {
          name: "Electronics",
          description: "Electronic devices and gadgets",
          subCategories: [
            "Smartphones", "Laptops", "Tablets", "Headphones", "Speakers", "Cameras", "Gaming Consoles"
          ]
        },
        {
          name: "Apparel",
          description: "Clothing, shoes, and fashion accessories",
          subCategories: [
            "Men's Clothing", "Women's Clothing", "Kids' Clothing", "Shoes", "Bags", "Jewelry", "Watches"
          ]
        },
        {
          name: "DIY and Hardware",
          description: "Do-it-yourself and hardware tools",
          subCategories: [
            "Power Tools", "Hand Tools", "Garden Tools", "Building Materials", "Paint", "Electrical"
          ]
        },
        {
          name: "Health, Personal Care, and Beauty",
          description: "Health and beauty products",
          subCategories: [
            "Skincare", "Makeup", "Hair Care", "Personal Care", "Vitamins", "Fitness"
          ]
        },
        {
          name: "Furniture and Home Décor",
          description: "Furniture and home decoration items",
          subCategories: [
            "Living Room", "Bedroom", "Kitchen", "Bathroom", "Outdoor", "Lighting", "Decor"
          ]
        },
        {
          name: "Media",
          description: "Books, movies, music, and digital media",
          subCategories: [
            "Books", "Movies", "Music", "Magazines", "Digital Downloads", "Audiobooks"
          ]
        },
        {
          name: "Toys and Hobbies",
          description: "Toys, games, and hobby supplies",
          subCategories: [
            "Outdoor Toys",
            "Board Games & Puzzles",
            "Arts & Crafts Supplies"
          ]
        }
      ];
      
      // Get existing categories
      const existingCategories = await api.get('/api/categories/admin/all');
      const existingCategoryNames = existingCategories.data.map(cat => cat.name);
      console.log('Existing categories:', existingCategoryNames);
      
      // Find missing main categories
      const missingMainCategories = allCategories.filter(cat => 
        !existingCategoryNames.includes(cat.name)
      );
      console.log('Missing main categories:', missingMainCategories);
      
      // Create missing main categories
      for (const category of missingMainCategories) {
        const categoryData = {
          name: category.name,
          description: category.description,
          isActive: true,
          image: '/accessories.png',
          slug: category.name.toLowerCase().replace(/\s+/g, '-')
        };
        
        try {
          const response = await api.post('/api/categories', categoryData);
          console.log(`Created main category: ${category.name}`);
          
          // Create sub-categories for this main category
          for (const subCatName of category.subCategories) {
            const subCategoryData = {
              name: subCatName,
              description: `${subCatName} under ${category.name}`,
              isActive: true,
              image: '/accessories.png',
              parentCategory: response.data._id,
              slug: subCatName.toLowerCase().replace(/\s+/g, '-')
            };
            
            try {
              await api.post('/api/categories', subCategoryData);
              console.log(`Created sub-category: ${subCatName} under ${category.name}`);
            } catch (error) {
              console.error(`Error creating sub-category ${subCatName}:`, error);
            }
          }
        } catch (error) {
          console.error(`Error creating main category ${category.name}:`, error);
        }
      }
      
      // Also check for product-specific categories that might not be in our predefined list
      const productCategories = [...new Set(products.map(p => p.categoryName).filter(Boolean))];
      const missingProductCategories = productCategories.filter(catName => 
        !existingCategoryNames.includes(catName) && 
        !allCategories.some(cat => cat.name === catName)
      );
      
      if (missingProductCategories.length > 0) {
        console.log('Additional product categories found:', missingProductCategories);
        
        for (const categoryName of missingProductCategories) {
          const categoryData = {
            name: categoryName,
            description: `Category for ${categoryName} products`,
            isActive: true,
            image: '/accessories.png',
            slug: categoryName.toLowerCase().replace(/\s+/g, '-')
          };
          
          try {
            await api.post('/api/categories', categoryData);
            console.log(`Created additional category: ${categoryName}`);
          } catch (error) {
            console.error(`Error creating additional category ${categoryName}:`, error);
          }
        }
      }
      
      // Refresh categories
      await fetchCategories();
      
      const totalCreated = missingMainCategories.length + missingProductCategories.length;
      if (totalCreated > 0) {
        alert(`Successfully synced ${totalCreated} categories and their sub-categories!`);
      } else {
        alert('All categories are already synced!');
      }
      
    } catch (error) {
      console.error('Error syncing categories:', error);
      alert('Error syncing categories. Please try again.');
    }
  };

  // Discount management functions
  const fetchDiscounts = async () => {
    setDiscountsLoading(true);
    try {
      const response = await api.get('/api/discounts');
      setDiscounts(response.data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setDiscountsLoading(false);
    }
  };

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/discounts', discountForm);
      setDiscounts([...discounts, response.data]);
      setShowAddDiscount(false);
      resetDiscountForm();
    } catch (error) {
      console.error('Error adding discount:', error);
    }
  };

  const handleEditDiscount = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/discounts/${editingDiscount._id}`, discountForm);
      setDiscounts(discounts.map(d => d._id === editingDiscount._id ? response.data : d));
      setShowEditDiscount(false);
      setEditingDiscount(null);
      resetDiscountForm();
    } catch (error) {
      console.error('Error updating discount:', error);
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        console.log('🗑️ Deleting discount with ID:', discountId);
        console.log('📊 Current discounts before deletion:', discounts);
        
        const response = await api.delete(`/api/discounts/${discountId}`);
        console.log('✅ Delete response:', response);
        
        // Update local state
        const updatedDiscounts = discounts.filter(d => d._id !== discountId);
        console.log('🔄 Updated discounts array:', updatedDiscounts);
        
        setDiscounts(updatedDiscounts);
        
        // Show success message
        alert('Discount deleted successfully!');
        
      } catch (error) {
        console.error('❌ Error deleting discount:', error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        alert(`Error deleting discount: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const refreshDiscounts = async () => {
    console.log('🔄 Refreshing discounts...');
    await fetchDiscounts();
  };

  const resetDiscountForm = () => {
    setDiscountForm({
      code: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscount: '',
      maxUses: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
      description: ''
    });
  };

  const openEditDiscount = (discount) => {
    setEditingDiscount(discount);
    setDiscountForm({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      minOrderAmount: discount.minOrderAmount || '',
      maxDiscount: discount.maxDiscount || '',
      maxUses: discount.maxUses || '',
      validFrom: discount.validFrom ? discount.validFrom.split('T')[0] : '',
      validUntil: discount.validUntil ? discount.validUntil.split('T')[0] : '',
      isActive: discount.isActive,
      description: discount.description || ''
    });
    setShowEditDiscount(true);
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
