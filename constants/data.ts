import uuid from "react-native-uuid";

//onboarding slider images
import onBoardingSliderImg1 from "@/assets/images/food9.png";
import onBoardingSliderImg2 from "@/assets/images/food7.png";
import onBoardingSliderImg3 from "@/assets/images/food8.png";

//offer image
import offferImage from "@/assets/images/home-slider-img.png";
import promotionImg from "@/assets/images/promotion_img.jpg";

//product Image
import productImage1 from "@/assets/images/product-img.png";
import productImage2 from "@/assets/images/product-img.png";
import productImage3 from "@/assets/images/product-img.png";
import productImage4 from "@/assets/images/product-img.png";
import productImage5 from "@/assets/images/product-img.png";
import productImage6 from "@/assets/images/product-img.png";
import productImage7 from "@/assets/images/product-img.png";

//review images
import reviewerImg1 from "@/assets/images/reviewer-1.png";
import reviewerImg2 from "@/assets/images/reviewer-1.png";
import reviewImg1 from "@/assets/images/review-img-1.png";
import reviewImg2 from "@/assets/images/review-img-1.png";
import reviewImg3 from "@/assets/images/review-img-1.png";
import reviewImg4 from "@/assets/images/review-img-1.png";
import reviewImg5 from "@/assets/images/review-img-1.png";
import reviewImg6 from "@/assets/images/review-img-1.png";
import reviewImg7 from "@/assets/images/review-img-1.png";
import reviewImg8 from "@/assets/images/review-img-1.png";
import reviewImg9 from "@/assets/images/review-img-1.png";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

//payment methods
import payoneerImg from "@/assets/images/payoneer.png";
import paypalImg from "@/assets/images/paypal.png";
import bankImg from "@/assets/images/bank.png";
import cardImg from "@/assets/images/card.png";

//choose delivey images
import tnt from "@/assets/images/tnt.png";
import fedex from "@/assets/images/fedx.png";
import aramex from "@/assets/images/aramex.png";
import ups from "@/assets/images/ups.png";
import estes from "@/assets/images/estes.png";
import React from "react";

export const onbordingSliderData = [
  {
    id: 1,
    img: onBoardingSliderImg1,
    title: "Köstliche Vielfalt entdecken",
    description:
      "Frisch, regional und mit Liebe zubereitet – genießen Sie unsere Gerichte.",
  },
  {
    id: 2,
    img: onBoardingSliderImg2,
    title: "Einfach bezahlen, schnell geliefert",
    description:
      "Zahlen Sie sicher mit PayPal, Kreditkarte oder Sofort – wir liefern zügig.",
  },
  {
    id: 3,
    img: onBoardingSliderImg3,
    title: "Frisch zu Ihnen nach Hause",
    description:
      "Restaurantqualität direkt an Ihrer Tür – heiß, lecker, zuverlässig.",
  },
];

export const offerSlider = [
  {
    id: 1,
    img: promotionImg,
    offer: "50% Rabatt",
    offerDesc: "Auf alle Speisen heute",
    bgColor: "#1b1b1b", // Primary brand color
    timerText: "Nur heute!",
    badgeText: "TAGESANGEBOT",
  },
  {
    id: 2,
    img: offferImage,
    offer: "25% Sparpreis",
    offerDesc: "Auf alle Fleischgerichte",
    bgColor: "#8e44ad", // Purple accent
    timerText: "Noch 2 Tage",
    badgeText: "BESTSELLER",
  },
  {
    id: 3,
    img: offferImage,
    offer: "12% Frühbucher",
    offerDesc: "Auf vegetarische Gerichte",
    bgColor: "#27ae60", // Green accent
    timerText: "Noch 5 Tage",
    badgeText: "VEGETARISCH",
  },
  {
    id: 4,
    img: promotionImg,
    offer: "1+1 Gratis",
    offerDesc: "Bei allen Getränken",
    bgColor: "#3498db", // Blue accent
    timerText: "Nur dieses Wochenende",
    badgeText: "SOMMERANGEBOT",
  },
  {
    id: 5,
    img: offferImage,
    offer: "Kindermenü 5€",
    offerDesc: "Inkl. Eis und Getränk",
    bgColor: "#e67e22", // Orange accent
    timerText: "Gültig bis 31.08",
    badgeText: "FAMILIENANGEBOT",
  },
];

export const productCategory = [
  "All",
  "Pizza",
  "Sandwiches",
  "Hamburgers",
  "Fries",
  "Hot Dogs",
  "Ice cream",
];

export const productItems = [
  {
    id: uuid.v4(),
    name: "Blue Finger Watch",
    productImg: productImage1,
    rating: "4.8",
    noOfRating: "11",
    noOfSold: "65",
    price: "88",
    discountedPrice: "80",
  },
  {
    id: uuid.v4(),
    name: "Gildan Bluetooth",
    productImg: productImage2,
    rating: "4.2",
    noOfRating: "16",
    noOfSold: "122",
    price: "81",
    discountedPrice: "75",
  },
  {
    id: uuid.v4(),
    name: "Daily Cream",
    productImg: productImage3,
    rating: "4.5",
    noOfRating: "47",
    noOfSold: "178",
    price: "71",
    discountedPrice: "60",
  },
  {
    id: uuid.v4(),
    name: "Womens Perfume",
    productImg: productImage4,
    rating: "4.6",
    noOfRating: "44",
    noOfSold: "186",
    price: "47",
    discountedPrice: "35",
  },
  {
    id: uuid.v4(),
    name: "Women Shoes",
    productImg: productImage5,
    rating: "4.1",
    noOfRating: "29",
    noOfSold: "71",
    price: "83",
    discountedPrice: "65",
  },
  {
    id: uuid.v4(),
    name: "Gorgeous Sunglass",
    productImg: productImage6,
    rating: "4.8",
    noOfRating: "41",
    noOfSold: "90",
    price: "90",
    discountedPrice: "70",
  },
  {
    id: uuid.v4(),
    name: "Gaming Headphone",
    productImg: productImage7,
    rating: "4.7",
    noOfRating: "22",
    noOfSold: "69",
    price: "52",
    discountedPrice: "45",
  },
];

export const filterProductCategory = [
  "All",
  "Cloth",
  "Shoe",
  "Bags",
  "Electronics",
  "Kids",
  "Womens",
  "Perfumes",
  "Watch",
  "Lifestyle",
  "Beauty",
];

export const filterBrandCategory = ["Adidas", "Nike", "Xerox", "Vans"];

export const availableVouchersData = [
  {
    id: uuid.v4(),
    title: "Best Deal: 20% OFF",
    totalDeal: "20DEALS",
    minSpend: "Min spend $150",
    validity: "Valid til 12/12/2024",
  },
  {
    id: uuid.v4(),
    title: "Best Deal: 35% OFF",
    totalDeal: "20DEALS",
    minSpend: "Min spend $150",
    validity: "Valid til 12/12/2024",
  },
  {
    id: uuid.v4(),
    title: "Best Deal: 28% OFF",
    totalDeal: "20DEALS",
    minSpend: "Min spend $150",
    validity: "Valid til 12/12/2024",
  },
];

export const productReviewData = [
  {
    id: uuid.v4(),
    name: "Robert Fox",
    userImg: reviewerImg1,
    reviewTime: "2 days ago",
    ratingStar: "3",
    review:
      "The item just arrived! Can't wait to try it this week. Hope it suits my style! 🔥",
    reviewimages: [reviewImg1, reviewImg2, reviewImg3],
    likeCount: "5",
    dislikeCount: "2",
  },
  {
    id: uuid.v4(),
    name: "Henry Jonson",
    userImg: reviewerImg2,
    reviewTime: "4 days ago",
    ratingStar: "4",
    review:
      "Urban Blend shirt is a versatile addition. Slightly snug but stylish and well-made ❤️",
    reviewimages: [reviewImg4, reviewImg5, reviewImg6],
    likeCount: "8",
    dislikeCount: "3",
  },
  {
    id: uuid.v4(),
    name: "Esther Howard",
    userImg: reviewerImg1,
    reviewTime: "2 weeks ago",
    ratingStar: "5",
    review:
      "The item just arrived! Can't wait to try it this week. Hope it suits my style! 🔥",
    reviewimages: [reviewImg7, reviewImg8, reviewImg9],
    likeCount: "4",
    dislikeCount: "1",
  },
];

export const cartData = [
  {
    id: uuid.v4(),
    name: "Daily Cream",
    productImg: productImage3,
    size: "L",
    color: "Black",
    qty: "3",
    price: "71",
    discountedPrice: "60",
  },
  {
    id: uuid.v4(),
    name: "Womens Perfume",
    productImg: productImage4,
    size: "M",
    color: "White",
    qty: "1",
    price: "47",
    discountedPrice: "35",
  },

  {
    id: uuid.v4(),
    name: "Gorgeous Sunglass",
    productImg: productImage6,
    size: "XL",
    color: "Yellow",
    qty: "1",
    price: "90",
    discountedPrice: "70",
  },
  {
    id: uuid.v4(),
    name: "Gaming Headphone",
    productImg: productImage7,
    size: "L",
    color: "White",
    qty: "2",
    price: "52",
    discountedPrice: "45",
  },
];

export const accountPageNamesData = [
  // {
  //   id: uuid.v4(),
  //   name: "Manage Address",
  //   icon: React.createElement(Feather, {
  //     name: "map-pin",
  //     size: 20,
  //     color: "#3f3f3f",
  //   }),
  //   link: "/ManageAddress",
  // },
  // {
  //   id: uuid.v4(),
  //   name: "Payment Methods",
  //   icon: React.createElement(MaterialIcons, {
  //     name: "payment",
  //     size: 20,
  //     color: "#3f3f3f",
  //   }),
  //   link: "/PaymentMethods",
  // },
  // {
  //   id: uuid.v4(),
  //   name: "Sprache",
  //   icon: React.createElement(Ionicons, {
  //     name: "language",
  //     size: 20,
  //     color: "#3f3f3f",
  //   }),
  //   link: "/Language",
  // },
  // {
  //   id: uuid.v4(),
  //   name: "Konto & Sicherheit",
  //   icon: React.createElement(MaterialIcons, {
  //     name: "security",
  //     size: 20,
  //     color: "#3f3f3f",
  //   }),
  //   link: "/AccountSecurity",
  // },
  // {
  //   id: uuid.v4(),
  //   name: "Mein Profil",
  //   icon: React.createElement(FontAwesome5, {
  //     name: "user",
  //     size: 20,
  //     color: "#3f3f3f",
  //   }),
  //   link: "/MyProfile",
  // },
  // {
  //   id: uuid.v4(),
  //   name: "App Appearance",
  //   icon: React.createElement(Feather, {
  //     name: "sun",
  //     size: 20,
  //     color: "#3f3f3f",
  //   }),
  //   link: "/AppApearance",
  // },
  // {
  //   id: uuid.v4(),
  //   name: "Notifications",
  //   icon: React.createElement(Ionicons, {
  //     name: "notifications-outline",
  //     size: 20,
  //   }),
  //   link: "/NotificationSetting",
  // },
  // {
  //   id: uuid.v4(),
  //   name: "Kontaktieren Sie Uns",
  //   icon: React.createElement(Ionicons, {
  //     name: "help",
  //     size: 20,
  //     color: "#3f3f3f",
  //   }),
  //   link: "/ContactsUs",
  // },
];

export const paymentMethodsData = [
  {
    id: uuid.v4(),
    name: "Paypal",
    icon: paypalImg,
  },
  {
    id: uuid.v4(),
    name: "Payoneer",
    icon: payoneerImg,
  },
  {
    id: uuid.v4(),
    name: "Bank Transfer",
    icon: bankImg,
  },
  {
    id: uuid.v4(),
    name: "Mastercard",
    icon: payoneerImg,
  },
  {
    id: uuid.v4(),
    name: "Card",
    icon: cardImg,
  },
];

export const accountSecurityItems = [
  {
    id: uuid.v4(),
    name: "Biometric ID",
    icon: React.createElement(Ionicons, {
      name: "finger-print-sharp",
      size: 16,
    }),
  },
  {
    id: uuid.v4(),
    name: "Face ID",
    icon: React.createElement(Entypo, {
      name: "emoji-happy",
      size: 16,
    }),
  },
  {
    id: uuid.v4(),
    name: "SMS Authenticator",
    icon: React.createElement(Ionicons, {
      name: "chatbubbles-outline",
      size: 16,
    }),
  },
  {
    id: uuid.v4(),
    name: "Google Authenticator",
    icon: React.createElement(AntDesign, {
      name: "google",
      size: 16,
    }),
  },
  {
    id: uuid.v4(),
    name: "Change Password",
    icon: React.createElement(Feather, {
      name: "key",
      size: 16,
    }),
  },
];

export const notificationData = [
  {
    id: uuid.v4(),
    name: "New Arrivals Notifications",
  },
  {
    id: uuid.v4(),
    name: "Sale Alerts",
  },
  {
    id: uuid.v4(),
    name: "Wishlist Updates",
  },
  {
    id: uuid.v4(),
    name: "Security Alerts",
  },
  {
    id: uuid.v4(),
    name: "Order Status Updates",
  },
  {
    id: uuid.v4(),
    name: "Exclusive Offers",
  },
  {
    id: uuid.v4(),
    name: "Style Recommendations",
  },
  {
    id: uuid.v4(),
    name: "Flash Sales Notifications",
  },
  {
    id: uuid.v4(),
    name: "Review Reminders",
  },
  {
    id: uuid.v4(),
    name: "App Updates and News",
  },
  {
    id: uuid.v4(),
    name: "Event Invitations",
  },
  {
    id: uuid.v4(),
    name: "Reward Program Updates",
  },
  {
    id: uuid.v4(),
    name: "Important Announcements",
  },
  {
    id: uuid.v4(),
    name: "App Tips and Tutorials",
  },
];

export const helpSupportLinks = [
  {
    id: uuid.v4(),
    text: "Help Center",
    isLink: true,
    link: "/HelpCenter",
  },
  {
    id: uuid.v4(),
    text: "Privacy Policy",
    isLink: true,
    link: "/PrivacyPolicy",
  },
  {
    id: uuid.v4(),
    text: "Terms of Service",
    isLink: true,
    link: "/TermsService",
  },
  {
    id: uuid.v4(),
    text: "Partner",
    isLink: false,
    link: "",
  },
  {
    id: uuid.v4(),
    text: "Job Vacancy",
    isLink: false,
    link: "",
  },
  {
    id: uuid.v4(),
    text: "Accessibility",
    isLink: false,
    link: "",
  },
  {
    id: uuid.v4(),
    text: "Feedback",
    isLink: false,
    link: "",
  },
  {
    id: uuid.v4(),
    text: "About Us",
    isLink: false,
    link: "",
  },
  {
    id: uuid.v4(),
    text: "Rate Us",
    isLink: false,
    link: "",
  },
  {
    id: uuid.v4(),
    text: "Visit Our Website",
    isLink: false,
    link: "",
  },
  {
    id: uuid.v4(),
    text: "Follow us on Social Media",
    isLink: false,
    link: "",
  },
];

export const faqData = [
  {
    id: 1,
    question: "How do I place an order?",
    answer:
      "ScoreX is greatest medical online consultation app platform in this century",
  },
  {
    id: 2,
    question: "Can I track my order?",
    answer:
      "ScoreX is greatest medical online consultation app platform in this century",
  },
  {
    id: 3,
    question: "What are the shipping options?",
    answer:
      "ScoreX is greatest medical online consultation app platform in this century",
  },
  {
    id: 4,
    question: "What payment methods are accepted?",
    answer:
      "ScoreX is greatest medical online consultation app platform in this century",
  },
  {
    id: 5,
    question: "How can I request a refund?",
    answer:
      "ScoreX is greatest medical online consultation app platform in this century",
  },
];

export const voucherItems = [
  {
    id: uuid.v4(),
    title: "Best Deal: 20% OFF",
  },
  {
    id: uuid.v4(),
    title: "20% OFF: New User Promotion",
  },
  {
    id: uuid.v4(),
    title: "Best Deal: 15% OFF",
  },
  {
    id: uuid.v4(),
    title: "8% OFF & 8% Cashback",
  },
  {
    id: uuid.v4(),
    title: "12% Cashback",
  },
];

export const deliveryItems = [
  {
    id: uuid.v4(),
    name: "TNT Express",
    price: "8",
    logo: tnt,
  },
  {
    id: uuid.v4(),
    name: "FedEx Express",
    price: "12",
    logo: fedex,
  },
  {
    id: uuid.v4(),
    name: "Aramex",
    price: "5",
    logo: aramex,
  },
  {
    id: uuid.v4(),
    name: "UPS (United Parcel Service)",
    price: "7",
    logo: ups,
  },
  {
    id: uuid.v4(),
    name: "Estes Express Lines",
    price: "9",
    logo: estes,
  },
];
