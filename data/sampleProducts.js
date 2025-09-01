const sampleProducts = [
  {
    name: "Premium Leather Armchair",
    sku: "CHAIR-001",
    description: "Elegant leather armchair with premium craftsmanship and comfortable seating. Perfect for living rooms and home offices.",
    price: 249.99,
    originalPrice: 399.99,
    categoryName: "Furniture",
    image: "/homegoods.png",
    images: ["/homegoods.png"],
    sizes: ["Standard"],
    colors: [
      { name: "Brown", hexCode: "#8B4513", inStock: true },
      { name: "Black", hexCode: "#000000", inStock: true }
    ],
    variants: [
      { size: "Standard", color: "Brown", price: 299.99, stock: 15, sku: "CHAIR-001-BROWN" },
      { size: "Standard", color: "Black", price: 299.99, stock: 12, sku: "CHAIR-001-BLACK" }
    ],
    inStock: true,
    stockQuantity: 27,
    featured: true,
    newArrival: false,
    trending: true,
    rating: 4.5,
    numReviews: 23,
    tags: ["furniture", "leather", "armchair", "premium", "comfortable"],
    weight: 25.5,
    dimensions: { length: 85, width: 75, height: 95 },
    shippingInfo: { freeShipping: true, estimatedDays: 3 }
  },
  {
    name: "Modern Bedside Table",
    sku: "TABLE-001",
    description: "Contemporary bedside table with clean lines and ample storage. Features a drawer and open shelf for organization.",
    price: 149.99,
    categoryName: "Furniture",
    image: "/homegoods.png",
    images: ["/homegoods.png"],
    sizes: ["Standard"],
    colors: [
      { name: "Walnut", hexCode: "#8B4513", inStock: true },
      { name: "White", hexCode: "#FFFFFF", inStock: true }
    ],
    variants: [
      { size: "Standard", color: "Walnut", price: 149.99, stock: 8, sku: "TABLE-001-WALNUT" },
      { size: "Standard", color: "White", price: 149.99, stock: 10, sku: "TABLE-001-WHITE" }
    ],
    inStock: true,
    stockQuantity: 18,
    featured: true,
    newArrival: true,
    trending: false,
    rating: 4.2,
    numReviews: 18,
    tags: ["furniture", "bedside", "table", "modern", "storage"],
    weight: 12.0,
    dimensions: { length: 45, width: 35, height: 55 },
    shippingInfo: { freeShipping: false, estimatedDays: 5 }
  },
  {
    name: "Casual Denim Jacket",
    sku: "JACKET-001",
    description: "Classic denim jacket with a modern fit. Perfect for layering in any season with comfortable stretch denim.",
    price: 69.99,
    originalPrice: 119.99,
    categoryName: "Apparel",
    image: "/apparel.webp",
    images: ["/apparel.webp"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { name: "Blue", hexCode: "#1E90FF", inStock: true },
      { name: "Black", hexCode: "#000000", inStock: true }
    ],
    variants: [
      { size: "S", color: "Blue", price: 89.99, stock: 25, sku: "JACKET-001-BLUE-S" },
      { size: "M", color: "Blue", price: 89.99, stock: 30, sku: "JACKET-001-BLUE-M" },
      { size: "L", color: "Blue", price: 89.99, stock: 28, sku: "JACKET-001-BLUE-L" }
    ],
    inStock: true,
    stockQuantity: 83,
    featured: false,
    newArrival: true,
    trending: true,
    rating: 4.7,
    numReviews: 45,
    tags: ["apparel", "jacket", "denim", "casual", "outerwear"],
    weight: 0.8,
    dimensions: { length: 70, width: 50, height: 5 },
    shippingInfo: { freeShipping: true, estimatedDays: 2 }
  },
  {
    name: "Wireless Bluetooth Headphones",
    sku: "HEADPHONES-001",
    description: "Premium wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 159.99,
    originalPrice: 249.99,
    categoryName: "Electronics",
    image: "/man-1281562.jpg",
    images: ["/man-1281562.jpg"],
    sizes: ["One Size"],
    colors: [
      { name: "Black", hexCode: "#000000", inStock: true },
      { name: "Silver", hexCode: "#C0C0C0", inStock: true }
    ],
    variants: [
      { size: "One Size", color: "Black", price: 199.99, stock: 20, sku: "HEADPHONES-001-BLACK" },
      { size: "One Size", color: "Silver", price: 199.99, stock: 15, sku: "HEADPHONES-001-SILVER" }
    ],
    inStock: true,
    stockQuantity: 35,
    featured: true,
    newArrival: false,
    trending: true,
    rating: 4.8,
    numReviews: 67,
    tags: ["electronics", "headphones", "wireless", "bluetooth", "noise-cancellation"],
    weight: 0.3,
    dimensions: { length: 20, width: 18, height: 8 },
    shippingInfo: { freeShipping: true, estimatedDays: 1 }
  },
  {
    name: "Casio Vintage A-158WA-1Q Digital Grey Dial Unisex Watch Silver Metal Strap (D011)",
    sku: "WATCH-001",
    description: "Dial Color: Grey, Case Shape: Rectangular, Dial Glass material: Mineral Band Color: Silver, Band Material: Stainless Steel Watch Movement Type: Quartz, Watch Display Type: Digital and Stainless Steel Bezel Case Material: Stainless Steel, Case Diameter: 32 millimeters, Size of case: 36.8×33.2×8.2mm Fold Over Clasp Warranty 1e895ufacturer; 2 Years Domestic Warranty",
    price: 1895,
    categoryName: "Accessories",
    image: "/man-815795.jpg",
    images: ["/man-815795.jpg"],
    sizes: ["Standard"],
    colors: [
      { name: "Silver", hexCode: "#C0C0C0", inStock: true },
      { name: "Grey", hexCode: "#808080", inStock: true }
    ],
    variants: [
      { size: "Standard", color: "Silver", price: 1895, stock: 15, sku: "WATCH-001-SILVER" },
      { size: "Standard", color: "Grey", price: 1895, stock: 12, sku: "WATCH-001-GREY" }
    ],
    inStock: true,
    stockQuantity: 27,
    featured: true,
    newArrival: false,
    trending: false,
    rating: 4.6,
    numReviews: 89,
    tags: ["accessories", "watch", "digital", "casio", "vintage", "unisex"],
    weight: 0.1,
    dimensions: { length: 36.8, width: 33.2, height: 8.2 },
    shippingInfo: { freeShipping: false, estimatedDays: 4 }
  },
  {
    name: "Iphone 16",
    sku: "PHONE-001",
    description: "Iphone",
    price: 99999,
    categoryName: "Accessories",
    image: "/space-shuttle-774_1280.jpg",
    images: ["/space-shuttle-774_1280.jpg"],
    sizes: ["Standard"],
    colors: [
      { name: "White", hexCode: "#FFFFFF", inStock: true },
      { name: "Black", hexCode: "#000000", inStock: true }
    ],
    variants: [
      { size: "Standard", color: "White", price: 99999, stock: 10, sku: "PHONE-001-WHITE" },
      { size: "Standard", color: "Black", price: 99999, stock: 8, sku: "PHONE-001-BLACK" }
    ],
    inStock: true,
    stockQuantity: 18,
    featured: false,
    newArrival: true,
    trending: true,
    rating: 4.9,
    numReviews: 156,
    tags: ["accessories", "phone", "iphone", "smartphone", "premium"],
    weight: 0.2,
    dimensions: { length: 15, width: 7.5, height: 0.8 },
    shippingInfo: { freeShipping: true, estimatedDays: 1 }
  },
  {
    name: "Premium Denim Jeans",
    sku: "JEANS-001",
    description: "High-quality denim jeans with perfect stretch and modern fit.",
    price: 2499,
    categoryName: "Apparel",
    image: "/man-1281562.jpg",
    images: ["/man-1281562.jpg"],
    sizes: ["28", "30", "32", "34", "36"],
    colors: [
      { name: "Blue", hexCode: "#1E90FF", inStock: true },
      { name: "Black", hexCode: "#000000", inStock: true }
    ],
    variants: [
      { size: "30", color: "Blue", price: 2499, stock: 25, sku: "JEANS-001-BLUE-30" },
      { size: "32", color: "Blue", price: 2499, stock: 30, sku: "JEANS-001-BLUE-32" },
      { size: "34", color: "Blue", price: 2499, stock: 28, sku: "JEANS-001-BLUE-34" }
    ],
    inStock: true,
    stockQuantity: 83,
    featured: true,
    newArrival: false,
    trending: true,
    rating: 4.7,
    numReviews: 45,
    tags: ["apparel", "jeans", "denim", "premium", "modern-fit"],
    weight: 0.8,
    dimensions: { length: 100, width: 50, height: 5 },
    shippingInfo: { freeShipping: true, estimatedDays: 2 }
  }
];

module.exports = sampleProducts; 