/**
 * Featured Product Data for Scrollytelling Experience
 * 
 * This data drives the scrollytelling landing page with a single premium product
 */

export const featuredProduct = {
    id: "green-haven-collection",
    name: "Green Haven Collection",
    tagline: "Nature's masterpiece, delivered to your doorstep",
    price: 99,
    currency: "$",
    description: "Premium eco-friendly plant collection with sustainable packaging",
    folderPath: "/assets", // Image sequence folder
    themeColor: "#2E7D32",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #7FC77D 100%)",

    features: [
        "100% Organic & Chemical-Free",
        "Sustainable Packaging",
        "Hand-Picked Premium Plants",
        "Expert Care Guide Included"
    ],

    stats: [
        { label: "Carbon Offset", value: "5kg/plant" },
        { label: "Growth Rate", value: "Fast" },
        { label: "Care Level", value: "Beginner" },
        { label: "Air Purification", value: "Excellent" }
    ],

    // Scrollytelling sections (4 progressive reveals as user scrolls)
    section1: {
        title: "Green Haven Collection",
        subtitle: "Nature's masterpiece"
    },

    section2: {
        title: "Breathe life into your space",
        subtitle: "Hand-picked plants that purify your air and elevate your home"
    },

    section3: {
        title: "Sustainably sourced",
        subtitle: "Every plant is grown using eco-friendly practices and renewable resources"
    },

    section4: {
        title: "Made with love, delivered with care",
        subtitle: "Premium packaging ensures your plants arrive fresh and thriving"
    },

    // Details section
    detailsSection: {
        title: "The Ultimate Plant Collection",
        description: "Our Green Haven Collection features a curated selection of premium houseplants, each hand-picked by our expert horticulturists. These plants are grown using 100% organic methods in sustainable nurseries, ensuring they're not just beautiful, but environmentally responsible. From air-purifying pothos to elegant peace lilies, each plant comes with detailed care instructions and our commitment to your satisfaction.",
        imageAlt: "Green Haven Collection Details"
    },

    // Quality/Sustainability section
    qualitySection: {
        title: "Grown with Purpose, Delivered with Pride",
        description: "We partner with local organic nurseries that share our commitment to sustainability. Our plants are never treated with harmful chemicals, and our packaging is 100% recyclable. From soil to doorstep, we minimize our carbon footprint while maximizing the joy these plants bring to your home. Every purchase offsets 5kg of CO2 through our reforestation program."
    },

    // Buy Now section
    buyNowSection: {
        price: "$99",
        unit: "per collection (3 premium plants)",
        features: [
            "Free Expert Care Guide (Digital + Printed)",
            "Eco-Friendly Sustainable Packaging",
            "100% Satisfaction Guarantee"
        ],
        deliveryPromise: "Next-day delivery available in metro cities. All plants arrive in climate-controlled packaging to ensure peak freshness and health.",
        returnPolicy: "Not thriving? We'll replace it within 30 days, no questions asked. Your satisfaction is our top priority."
    }
};

export default featuredProduct;
