const sampleProducts = [
  {
    name: "Premium Leather Armchair",
    sku: "CHAIR-001",
    description: "Elegant leather armchair with premium craftsmanship and comfortable seating. Perfect for living rooms and home offices.",
    price: 299.99,
    categoryName: "Furniture",
    image: "/accessories.png",
    images: ["/accessories.png"],
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
    price: 89.99,
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
    price: 199.99,
    categoryName: "Electronics",
    image: "/accessories.png",
    images: ["/accessories.png"],
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
    name: "Organic Cotton T-Shirt",
    sku: "TSHIRT-001",
    description: "Soft and comfortable organic cotton t-shirt. Available in multiple colors with a relaxed fit for everyday wear.",
    price: 29.99,
    categoryName: "Apparel",
    image: "/apparel.webp",
    images: ["/apparel.webp"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "White", hexCode: "#FFFFFF", inStock: true },
      { name: "Navy", hexCode: "#000080", inStock: true },
      { name: "Gray", hexCode: "#808080", inStock: true }
    ],
    variants: [
      { size: "M", color: "White", price: 29.99, stock: 50, sku: "TSHIRT-001-WHITE-M" },
      { size: "L", color: "Navy", price: 29.99, stock: 45, sku: "TSHIRT-001-NAVY-L" },
      { size: "XL", color: "Gray", price: 29.99, stock: 40, sku: "TSHIRT-001-GRAY-XL" }
    ],
    inStock: true,
    stockQuantity: 135,
    featured: false,
    newArrival: true,
    trending: false,
    rating: 4.3,
    numReviews: 89,
    tags: ["apparel", "t-shirt", "cotton", "organic", "casual"],
    weight: 0.2,
    dimensions: { length: 70, width: 50, height: 2 },
    shippingInfo: { freeShipping: true, estimatedDays: 2 }
  }
];

module.exports = sampleProducts; 