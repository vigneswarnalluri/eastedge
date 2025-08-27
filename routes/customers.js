const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Order = require('../models/Order');

// Get all customers with comprehensive data (ADMIN ONLY)
router.get('/admin/customers', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 10, search = '', status = '', tier = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      if (status === 'no-orders') {
        searchQuery['orderStats.totalOrders'] = 0;
      } else {
        searchQuery['orderStats.orderStatusBreakdown.pending'] = { $gt: 0 };
      }
    }

    // Add loyalty tier filter
    if (tier && tier !== 'all') {
      searchQuery['loyalty.tier'] = tier;
    }

    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get customers with pagination and comprehensive data
    const customers = await Customer.find(searchQuery)
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email phone createdAt')
      .populate('status.blockedBy', 'name email');

    // Get total count for pagination
    const totalCustomers = await Customer.countDocuments(searchQuery);

    // Get comprehensive customer analytics
    const analytics = await Customer.aggregate([
      { $match: searchQuery },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          totalRevenue: { $sum: '$orderStats.totalSpent' },
          averageOrderValue: { $avg: '$orderStats.averageOrderValue' },
          customersWithOrders: {
            $sum: { $cond: [{ $gt: ['$orderStats.totalOrders', 0] }, 1, 0] }
          },
          newCustomersThisMonth: {
            $sum: {
              $cond: [
                { $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)] },
                1,
                0
              ]
            }
          },
          loyaltyTiers: {
            bronze: { $sum: { $cond: [{ $eq: ['$loyalty.tier', 'bronze'] }, 1, 0] } },
            silver: { $sum: { $cond: [{ $eq: ['$loyalty.tier', 'silver'] }, 1, 0] } },
            gold: { $sum: { $cond: [{ $eq: ['$loyalty.tier', 'gold'] }, 1, 0] } },
            platinum: { $sum: { $cond: [{ $eq: ['$loyalty.tier', 'platinum'] }, 1, 0] } }
          },
          orderStatusBreakdown: {
            pending: { $sum: '$orderStats.orderStatusBreakdown.pending' },
            processing: { $sum: '$orderStats.orderStatusBreakdown.processing' },
            shipped: { $sum: '$orderStats.orderStatusBreakdown.shipped' },
            delivered: { $sum: '$orderStats.orderStatusBreakdown.delivered' },
            cancelled: { $sum: '$orderStats.orderStatusBreakdown.cancelled' }
          }
        }
      }
    ]);

    res.json({
      success: true,
      customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCustomers / limit),
        totalCustomers,
        hasNextPage: page * limit < totalCustomers,
        hasPrevPage: page > 1
      },
      analytics: analytics[0] || {
        totalCustomers: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        customersWithOrders: 0,
        newCustomersThisMonth: 0,
        loyaltyTiers: { bronze: 0, silver: 0, gold: 0, platinum: 0 },
        orderStatusBreakdown: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// Get detailed customer information (ADMIN ONLY)
router.get('/admin/customers/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    
    // Get customer with populated data
    const customer = await Customer.findById(id)
      .populate('userId', 'name email phone createdAt')
      .populate('status.blockedBy', 'name email')
      .populate('loyalty.referredBy', 'name email');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get customer's recent orders
    const recentOrders = await Order.find({ user: customer.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    // Get customer's support tickets
    const supportTickets = customer.supportTickets || [];

    // Get customer's communication history
    const communications = customer.communications || [];

    res.json({
      success: true,
      customer,
      recentOrders,
      supportTickets,
      communications
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer details' });
  }
});

// Create or update customer profile (ADMIN ONLY)
router.post('/admin/customers', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { userId, profile, preferences, notes } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if customer already exists
    let customer = await Customer.findOne({ userId });

    if (customer) {
      // Update existing customer
      customer.profile = { ...customer.profile, ...profile };
      customer.status.notes = notes;
      if (preferences) {
        customer.profile.preferences = { ...customer.profile.preferences, ...preferences };
      }
      await customer.save();
    } else {
      // Create new customer
      customer = new Customer({
        userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile,
        status: { notes }
      });
      await customer.save();
    }

    res.json({
      success: true,
      message: customer ? 'Customer updated successfully' : 'Customer created successfully',
      customer
    });
  } catch (error) {
    console.error('Error creating/updating customer:', error);
    res.status(500).json({ success: false, message: 'Failed to create/update customer' });
  }
});

// Update customer status (block/unblock) (ADMIN ONLY)
router.put('/admin/customers/:id/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { isBlocked, reason, notes } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Update customer status
    customer.status.isBlocked = isBlocked;
    customer.status.blockReason = reason;
    customer.status.blockedAt = isBlocked ? new Date() : null;
    customer.status.blockedBy = isBlocked ? req.user._id : null;
    if (notes) {
      customer.status.notes = notes;
    }

    await customer.save();

    res.json({
      success: true,
      message: `Customer ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      customer
    });
  } catch (error) {
    console.error('Error updating customer status:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer status' });
  }
});

// Add customer notes (ADMIN ONLY)
router.put('/admin/customers/:id/notes', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { notes } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.status.notes = notes;
    await customer.save();

    res.json({
      success: true,
      message: 'Customer notes updated successfully',
      customer
    });
  } catch (error) {
    console.error('Error updating customer notes:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer notes' });
  }
});

// Add customer tags (ADMIN ONLY)
router.put('/admin/customers/:id/tags', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { tags } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.status.tags = tags;
    await customer.save();

    res.json({
      success: true,
      message: 'Customer tags updated successfully',
      customer
    });
  } catch (error) {
    console.error('Error updating customer tags:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer tags' });
  }
});

// Create support ticket for customer (ADMIN ONLY)
router.post('/admin/customers/:id/support-ticket', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { subject, description, priority } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const ticketData = {
      ticketId: `TKT-${Date.now()}`,
      subject,
      description,
      priority: priority || 'medium',
      status: 'open',
      assignedTo: req.user._id
    };

    await customer.createSupportTicket(ticketData);

    res.json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: ticketData
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to create support ticket' });
  }
});

// Update support ticket status (ADMIN ONLY)
router.put('/admin/customers/:id/support-ticket/:ticketId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { id, ticketId } = req.params;
    const { status, notes } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const ticket = customer.supportTickets.find(t => t.ticketId === ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found' });
    }

    ticket.status = status;
    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
    }
    if (notes) {
      ticket.notes = notes;
    }

    await customer.save();

    res.json({
      success: true,
      message: 'Support ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to update support ticket' });
  }
});

// Get customer analytics dashboard (ADMIN ONLY)
router.get('/admin/customers/analytics/dashboard', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { period = 'month' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get comprehensive analytics
    const analytics = await Customer.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                totalRevenue: { $sum: '$orderStats.totalSpent' },
                averageOrderValue: { $avg: '$orderStats.averageOrderValue' },
                customersWithOrders: { $sum: { $cond: [{ $gt: ['$orderStats.totalOrders', 0] }, 1, 0] } }
              }
            }
          ],
          newCustomers: [
            { $match: { createdAt: { $gte: startDate } } },
            { $count: 'count' }
          ],
          loyaltyTiers: [
            {
              $group: {
                _id: '$loyalty.tier',
                count: { $sum: 1 }
              }
            }
          ],
          orderStatusBreakdown: [
            {
              $group: {
                _id: null,
                pending: { $sum: '$orderStats.orderStatusBreakdown.pending' },
                processing: { $sum: '$orderStats.orderStatusBreakdown.processing' },
                shipped: { $sum: '$orderStats.orderStatusBreakdown.shipped' },
                delivered: { $sum: '$orderStats.orderStatusBreakdown.delivered' },
                cancelled: { $sum: '$orderStats.orderStatusBreakdown.cancelled' }
              }
            }
          ],
          topCategories: [
            { $unwind: '$orderStats.favoriteCategories' },
            {
              $group: {
                _id: '$orderStats.favoriteCategories.category',
                totalOrders: { $sum: '$orderStats.favoriteCategories.count' }
              }
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 5 }
          ],
          customerGrowth: [
            {
              $group: {
                _id: {
                  year: { $year: '$createdAt' },
                  month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      analytics: analytics[0],
      period,
      startDate,
      endDate: now
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer analytics' });
  }
});

// Export customers data (ADMIN ONLY)
router.get('/admin/customers/export', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { format = 'json' } = req.query;

    const customers = await Customer.find()
      .populate('userId', 'name email phone createdAt')
      .select('-communications -supportTickets');

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = customers.map(customer => ({
        'Customer ID': customer._id,
        'Name': customer.name,
        'Email': customer.email,
        'Phone': customer.phone || 'N/A',
        'Total Orders': customer.orderStats.totalOrders,
        'Total Spent': customer.orderStats.totalSpent,
        'Loyalty Tier': customer.loyalty.tier,
        'Status': customer.status.isBlocked ? 'Blocked' : 'Active',
        'Joined': customer.createdAt.toISOString().split('T')[0]
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      
      // Convert to CSV string
      const csvString = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      res.send(csvString);
    } else {
      res.json({
        success: true,
        customers,
        exportDate: new Date(),
        totalCustomers: customers.length
      });
    }
  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({ success: false, message: 'Failed to export customers' });
  }
});

module.exports = router; 