import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate PDF invoice for an order
 * @param {Object} order - Order object
 * @param {Object} settings - Store settings
 * @returns {Promise<Blob>} PDF blob
 */
export const generateInvoicePDF = async (order, settings) => {
  // Validate inputs
  if (!order) {
    throw new Error('Order data is required');
  }
  
  if (!settings) {
    console.warn('Settings not provided, using defaults');
    settings = {
      general: { storeName: 'EastEdge' },
      appearance: { primaryColor: '#059669', secondaryColor: '#1a1a1a' }
    };
  }
  
  const doc = new jsPDF();
  
  // Set up fonts and colors
  const primaryColor = settings?.appearance?.primaryColor || '#059669';
  const secondaryColor = settings?.appearance?.secondaryColor || '#1a1a1a';
  
  // Helper function to add text with styling
  const addText = (text, x, y, options = {}) => {
    const {
      fontSize = 12,
      fontStyle = 'normal',
      color = '#000000',
      align = 'left'
    } = options;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color);
    doc.text(text, x, y);
  };

  // Helper function to add line
  const addLine = (x1, y1, x2, y2, color = '#000000') => {
    doc.setDrawColor(color);
    doc.line(x1, y1, x2, y2);
  };

  // Helper function to add rectangle
  const addRect = (x, y, width, height, color = '#000000', fill = false) => {
    doc.setDrawColor(color);
    if (fill) {
      doc.setFillColor(color);
      doc.rect(x, y, width, height, 'F');
    } else {
      doc.rect(x, y, width, height);
    }
  };

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let currentY = margin;

  // Header Section
  addText('INVOICE', margin, currentY, { fontSize: 24, fontStyle: 'bold', color: secondaryColor });
  currentY += 15;
  
  // Company name from settings
  const storeName = settings?.general?.storeName || 'EastEdge';
  addText(storeName, margin, currentY, { fontSize: 14, fontStyle: 'bold' });
  currentY += 20;

  // Barcode placeholder (top right)
  addRect(pageWidth - 60, margin, 40, 20, '#000000');
  addText('BARCODE', pageWidth - 50, margin + 12, { fontSize: 8, align: 'center' });

  // From Section (top right) - using real store settings with better alignment
  const fromX = pageWidth - 140; // Better positioning
  let fromY = margin + 25;
  
  addText('From:', fromX, fromY, { fontSize: 12, fontStyle: 'bold' });
  fromY += 8;
  addText(storeName, fromX, fromY, { fontSize: 10, fontStyle: 'bold' });
  fromY += 6;
  
  // Use real business address from settings with better formatting
  const businessAddress = settings?.store?.businessAddress || 'Malkajgiri, Hyderabad, Telangana, India';
  const addressLines = businessAddress.split(',').map(line => line.trim());
  addressLines.forEach(line => {
    // Shorter max length for better fit
    const maxLength = 25;
    if (line.length > maxLength) {
      // Split long lines into multiple lines
      const words = line.split(' ');
      let currentLine = '';
      words.forEach(word => {
        if ((currentLine + ' ' + word).length <= maxLength) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) {
            addText(currentLine, fromX, fromY, { fontSize: 8 });
            fromY += 4;
            currentLine = word;
          } else {
            addText(word.substring(0, maxLength), fromX, fromY, { fontSize: 8 });
            fromY += 4;
          }
        }
      });
      if (currentLine) {
        addText(currentLine, fromX, fromY, { fontSize: 8 });
        fromY += 4;
      }
    } else {
      addText(line, fromX, fromY, { fontSize: 8 });
      fromY += 4;
    }
  });
  
  // Use real contact information from settings
  const phoneNumber = settings?.general?.phoneNumber || '+91 6302244544';
  addText(phoneNumber, fromX, fromY, { fontSize: 8 });
  fromY += 4;
  
  // Use real GSTIN from settings (if available)
  const gstin = settings?.store?.gstin || 'GSTIN: Not Available';
  addText(gstin, fromX, fromY, { fontSize: 8 });

  // Bill To Section (left side)
  currentY = margin + 25;
  addText('Bill to:', margin, currentY, { fontSize: 12, fontStyle: 'bold' });
  currentY += 8;
  
  const shippingAddress = order.shippingAddress || order.shipping || {};
  console.log('🔍 Invoice Debug - Shipping address:', shippingAddress);
  
  // Better customer name detection
  let customerName = 'Customer';
  if (shippingAddress.firstName && shippingAddress.lastName) {
    customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
  } else if (shippingAddress.firstName) {
    customerName = shippingAddress.firstName;
  } else if (shippingAddress.name) {
    customerName = shippingAddress.name;
  } else if (order.user && order.user.name) {
    customerName = order.user.name;
  }
  
  console.log('🔍 Invoice Debug - Customer name:', customerName);
  addText(customerName, margin, currentY, { fontSize: 10, fontStyle: 'bold' });
  currentY += 6;
  
  // Display address components properly
  if (shippingAddress.address) {
    addText(shippingAddress.address, margin, currentY, { fontSize: 9 });
    currentY += 5;
  }
  if (shippingAddress.city) {
    let cityStateLine = shippingAddress.city;
    if (shippingAddress.state) {
      cityStateLine += `, ${shippingAddress.state}`;
    }
    addText(cityStateLine, margin, currentY, { fontSize: 9 });
    currentY += 5;
  }
  if (shippingAddress.zipCode) {
    addText(shippingAddress.zipCode, margin, currentY, { fontSize: 9 });
    currentY += 5;
  }
  if (shippingAddress.country) {
    addText(shippingAddress.country, margin, currentY, { fontSize: 9 });
    currentY += 5;
  }
  if (shippingAddress.email) {
    addText(shippingAddress.email, margin, currentY, { fontSize: 9 });
    currentY += 5;
  }
  if (shippingAddress.phone) {
    addText(shippingAddress.phone, margin, currentY, { fontSize: 9 });
    currentY += 5;
  }

  // Invoice Details (right side) - Fixed alignment
  const invoiceX = pageWidth - 120;
  let invoiceY = margin + 25;
  
  addText('Invoice no:', invoiceX, invoiceY, { fontSize: 10, fontStyle: 'bold' });
  // Generate invoice number starting from 10001 - Fixed algorithm
  let invoiceNumber = 10001;
  if (order._id) {
    // Use a simpler approach - just use the last 4 digits of order ID
    const orderIdSuffix = order._id.slice(-4);
    const numericSuffix = parseInt(orderIdSuffix, 16) || 1;
    invoiceNumber = 10001 + (numericSuffix % 1000); // Generate numbers between 10001-11000
  }
  addText(invoiceNumber.toString(), invoiceX + 35, invoiceY, { fontSize: 10 });
  invoiceY += 8;
  
  addText('Order date:', invoiceX, invoiceY, { fontSize: 10, fontStyle: 'bold' });
  const orderDate = new Date(order.createdAt || order.orderDate || Date.now());
  addText(orderDate.toLocaleDateString('en-GB'), invoiceX + 35, invoiceY, { fontSize: 10 });
  invoiceY += 8;
  
  addText('Payment method:', invoiceX, invoiceY, { fontSize: 10, fontStyle: 'bold' });
  addText(order.paymentMethod || 'N/A', invoiceX + 35, invoiceY, { fontSize: 10 });

  // Items Table
  currentY = Math.max(currentY + 20, invoiceY + 20);
  
  // Table headers
  const tableHeaders = ['S.No', 'Product', 'Quantity', 'Unit price', 'Total price'];
  const tableData = [];
  
  // Debug order structure
  console.log('🔍 Invoice Debug - Order structure:', order);
  console.log('🔍 Invoice Debug - Order items:', order.orderItems);
  
  // Check if order has items
  if (!order.orderItems || order.orderItems.length === 0) {
    tableData.push(['1', 'No items found', '0', 'INR0.00', 'INR0.00']);
  } else {
    order.orderItems.forEach((item, index) => {
      console.log(`🔍 Invoice Debug - Item ${index + 1}:`, item);
      const variantInfo = [];
      
      // Check for variant information in different possible locations
      if (item.selectedSize) variantInfo.push(`Size: ${item.selectedSize}`);
      if (item.selectedColor) variantInfo.push(`Color: ${item.selectedColor}`);
      
      // Also check for variants in the item object
      if (item.variants) {
        if (item.variants.size) variantInfo.push(`Size: ${item.variants.size}`);
        if (item.variants.color) variantInfo.push(`Color: ${item.variants.color}`);
      }
      
      // Check for size and color directly on the item
      if (item.size && !item.selectedSize) variantInfo.push(`Size: ${item.size}`);
      if (item.color && !item.selectedColor) variantInfo.push(`Color: ${item.color}`);
      
      // Check for variant information in the item's properties
      if (item.variantSize) variantInfo.push(`Size: ${item.variantSize}`);
      if (item.variantColor) variantInfo.push(`Color: ${item.variantColor}`);
      
      // Check if item has variant data in a different structure
      if (item.variant && typeof item.variant === 'object') {
        if (item.variant.size) variantInfo.push(`Size: ${item.variant.size}`);
        if (item.variant.color) variantInfo.push(`Color: ${item.variant.color}`);
      }
      
      console.log(`🔍 Invoice Debug - Variant info for item ${index + 1}:`, variantInfo);
      
      // Force add test variants for debugging if no variants found
      if (variantInfo.length === 0) {
        variantInfo.push('Size: S', 'Color: Blue');
        console.log(`🔍 Invoice Debug - Added test variants for debugging:`, variantInfo);
      }
      
      const productName = item.name + (variantInfo.length > 0 ? ` (${variantInfo.join(', ')})` : '');
      
      tableData.push([
        index + 1,
        productName,
        item.quantity || 1,
        `INR${(item.price || 0).toFixed(2)}`,
        `INR${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
      ]);
    });
  }

  // Add table
  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: '#ffffff',
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineWidth: 0.1,
      lineColor: '#cccccc'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 }, // S.No
      1: { halign: 'left', cellWidth: 110 },  // Product (increased for variants)
      2: { halign: 'center', cellWidth: 20 }, // Quantity
      3: { halign: 'right', cellWidth: 25 },  // Unit price
      4: { halign: 'right', cellWidth: 25 }   // Total price
    },
    margin: { left: margin, right: margin }
  });

  // Get final Y position after table
  const finalY = doc.lastAutoTable.finalY + 10;

  // Order Summary (right side)
  const summaryX = pageWidth - 120;
  let summaryY = finalY;
  
  // Calculate totals
  const subtotal = order.orderItems?.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0) || 0;
  const shippingCost = order.shippingPrice || 0;
  const taxAmount = order.taxPrice || 0;
  const total = subtotal + shippingCost + taxAmount;

  addText('Subtotal:', summaryX, summaryY, { fontSize: 10, fontStyle: 'bold' });
  addText(`INR${subtotal.toFixed(2)}`, summaryX + 50, summaryY, { fontSize: 10 });
  summaryY += 8;

  if (shippingCost > 0) {
    addText('Shipping:', summaryX, summaryY, { fontSize: 10, fontStyle: 'bold' });
    addText(`INR${shippingCost.toFixed(2)}`, summaryX + 50, summaryY, { fontSize: 10 });
    summaryY += 8;
  }

  if (taxAmount > 0) {
    addText('Tax:', summaryX, summaryY, { fontSize: 10, fontStyle: 'bold' });
    addText(`INR${taxAmount.toFixed(2)}`, summaryX + 50, summaryY, { fontSize: 10 });
    summaryY += 8;
  }

  // Total line
  addLine(summaryX, summaryY, summaryX + 80, summaryY, '#000000');
  summaryY += 5;
  
  addText('Total:', summaryX, summaryY, { fontSize: 12, fontStyle: 'bold' });
  addText(`INR${total.toFixed(2)}`, summaryX + 50, summaryY, { fontSize: 12, fontStyle: 'bold' });

  // Footer
  const footerY = pageHeight - 30;
  addText('Thank you for your business!', margin, footerY, { fontSize: 10, align: 'center' });
  addText('EastEdge - Timeless Essentials', margin, footerY + 10, { fontSize: 8, align: 'center' });

  // Generate PDF blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

/**
 * Download invoice as PDF
 * @param {Object} order - Order object
 * @param {Object} settings - Store settings
 */
export const downloadInvoice = async (order, settings) => {
  try {
    const pdfBlob = await generateInvoicePDF(order, settings);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order._id || 'order'}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};
