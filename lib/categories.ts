import {
  Shirt,
  Home,
  Smartphone,
  Sparkles,
  Baby,
  Package,
  Gem,
  Star,
} from "lucide-react";

export const categories = [
  {
    name: "Women Ethnic",
    icon: Sparkles,
    color: "from-pink-500 via-rose-500 to-purple-500",
    subcategories: [
      {
        title: "Sarees",
        items: [
          "All Sarees",
          "Silk Sarees",
          "Banarasi Silk Sarees",
          "Cotton Sarees",
          "Georgette Sarees",
          "Chiffon Sarees",
          "Heavy Work Sarees",
          "Net Sarees",
        ],
      },
      {
        title: "Kurtis",
        items: [
          "All Kurtis",
          "Anarkali Kurtis",
          "Rayon Kurtis",
          "Cotton Kurtis",
          "Chikankari Kurtis",
        ],
      },
      {
        title: "Kurta Sets",
        items: [
          "All Kurta Sets",
          "Kurta Palazzo Sets",
          "Rayon Kurta Sets",
          "Kurta Pant Sets",
          "Cotton Kurta Sets",
          "Sharara Sets",
        ],
      },
      {
        title: "Dupatta Sets",
        items: ["Cotton Sets", "Rayon Sets", "Printed Sets"],
      },
      {
        title: "Suits & Dress Material",
        items: [
          "All Suits & Dress Material",
          "Cotton Suits",
          "Embroidered Suits",
          "Crepe Suits",
          "Silk Suits",
          "Patiala Suits",
        ],
      },
      {
        title: "Lehengas",
        items: ["Lehenga Cholis", "Net Lehenga", "Bridal Lehenga"],
      },
      {
        title: "Other Ethnic",
        items: [
          "Blouses",
          "Dupattas",
          "Lehanga",
          "Gown",
          "Skirts & Bottomwear",
          "Islamic Fashion",
          "Petticoats",
        ],
      },
    ],
  },
  {
    name: "Women Western",
    icon: Gem,
    color: "from-fuchsia-500 via-pink-500 to-rose-500",
    subcategories: [
      {
        title: "Topwear",
        items: ["All Topwear", "Tops", "Dresses", "T-shirts", "Jumpsuits"],
      },
      {
        title: "Bottomwear",
        items: [
          "All Bottomwear",
          "Jeans & Jeggings",
          "Palazzos",
          "Shorts",
          "Skirts",
        ],
      },
      {
        title: "Innerwear",
        items: ["Bra", "Women Innerwear", "Briefs"],
      },
      {
        title: "Sleepwear",
        items: ["Nightsuits", "Women Nightdress"],
      },
      {
        title: "Maternity Wear",
        items: ["All Maternity & Feedingwear", "Maternity Kurtis & Dresses"],
      },
      {
        title: "Sports Wear",
        items: ["All Women Sportswear", "Sports Bra"],
      },
    ],
  },
  {
    name: "Men",
    icon: Shirt,
    color: "from-blue-500 via-indigo-500 to-purple-500",
    subcategories: [
      {
        title: "Top Wear",
        items: ["T-Shirts", "Shirts", "Polos", "Hoodies", "Jackets"],
      },
      {
        title: "Bottom Wear",
        items: ["Jeans", "Trousers", "Shorts", "Track Pants"],
      },
      {
        title: "Ethnic Wear",
        items: ["Kurtas", "Sherwanis", "Ethnic Sets"],
      },
      {
        title: "Innerwear",
        items: ["Briefs", "Vests", "Boxers"],
      },
    ],
  },
  {
    name: "Kids",
    icon: Baby,
    color: "from-green-400 via-emerald-500 to-teal-500",
    subcategories: [
      {
        title: "Boys",
        items: ["T-Shirts", "Shirts", "Jeans", "Ethnic Wear", "Sets"],
      },
      {
        title: "Girls",
        items: ["Dresses", "Tops", "Ethnic Wear", "Frocks", "Sets"],
      },
      {
        title: "Baby Care",
        items: ["Diapers", "Baby Clothing", "Feeding", "Bath & Skin"],
      },
    ],
  },
  {
    name: "Home & Kitchen",
    icon: Home,
    color: "from-cyan-500 via-blue-500 to-indigo-500",
    subcategories: [
      {
        title: "Home Decor",
        items: ["Wall Decor", "Clocks", "Showpieces", "Cushions"],
      },
      {
        title: "Kitchen",
        items: ["Cookware", "Storage", "Utensils", "Appliances"],
      },
      {
        title: "Bedding",
        items: ["Bed Sheets", "Blankets", "Pillows", "Mattresses"],
      },
    ],
  },
  {
    name: "Beauty & Health",
    icon: Sparkles,
    color: "from-amber-400 via-orange-500 to-red-500",
    subcategories: [
      {
        title: "Makeup",
        items: ["Lipstick", "Kajal", "Foundation", "Eye Makeup"],
      },
      {
        title: "Skincare",
        items: ["Face Care", "Body Care", "Sunscreen", "Cleansers"],
      },
      {
        title: "Haircare",
        items: ["Shampoo", "Hair Oil", "Conditioner", "Hair Color"],
      },
      {
        title: "Health",
        items: ["Supplements", "Wellness", "Personal Care"],
      },
    ],
  },
  {
    name: "Electronics",
    icon: Smartphone,
    color: "from-violet-500 via-purple-500 to-fuchsia-500",
    subcategories: [
      {
        title: "Mobile Accessories",
        items: ["Cases & Covers", "Screen Guards", "Chargers", "Cables"],
      },
      {
        title: "Electronics",
        items: ["Headphones", "Speakers", "Smart Watches", "Power Banks"],
      },
    ],
  },
  {
    name: "Accessories",
    icon: Gem,
    color: "from-pink-400 via-rose-500 to-red-500",
    subcategories: [
      {
        title: "Jewellery",
        items: ["Earrings", "Necklaces", "Rings", "Bangles", "Anklets"],
      },
      {
        title: "Bags",
        items: ["Handbags", "Backpacks", "Wallets", "Clutches"],
      },
      {
        title: "Footwear",
        items: ["Heels", "Flats", "Sandals", "Sneakers", "Slippers"],
      },
      {
        title: "Watches",
        items: ["Men Watches", "Women Watches", "Smart Watches"],
      },
    ],
  },
  {
    name: "Daily Essentials",
    icon: Package,
    color: "from-slate-400 via-gray-500 to-zinc-500",
    subcategories: [
      {
        title: "Groceries",
        items: ["Staples", "Snacks", "Beverages"],
      },
      {
        title: "Household",
        items: ["Cleaning", "Detergents", "Bathroom"],
      },
    ],
  },
  {
    name: "Anime",
    icon: Star,
    color: "from-yellow-400 via-amber-500 to-orange-500",
    subcategories: [
      {
        title: "Merchandise",
        items: ["T-Shirts", "Hoodies", "Posters", "Figures", "Accessories"],
      },
    ],
  },
];

// Helper function to get all subcategories for a category
export function getSubcategoriesForCategory(categoryName: string): string[] {
  const category = categories.find((cat) => cat.name === categoryName);
  if (!category) return [];

  return category.subcategories.flatMap((sub) => sub.items);
}

// Helper function to get all category names
export function getCategoryNames(): string[] {
  return categories.map((cat) => cat.name);
}
