const { onCall } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const EVERY_ORG_API_KEY = "pk_live_2b59b94c0078e40768e8115d2262f3b6";
const BASE_URL = "https://partners.every.org/v0.2";

exports.getCharities = onCall({
  region: "us-central1",
  cors: ["http://localhost:3000", "https://userauth-606ec.web.app"],
  maxInstances: 10,
  timeoutSeconds: 30,
}, async (request) => {
  try {
    console.log("Fetching charities from Every.org...");
    const category = request.data?.category || "featured";

    // Different endpoints for different categories
    const endpoints = {
      featured: `${BASE_URL}/browse/featured/nonprofits`,
      latest: `${BASE_URL}/browse/newest/nonprofits`,
      top: `${BASE_URL}/browse/popular/nonprofits`,
    };

    const response = await axios.get(endpoints[category], {
      params: {
        apiKey: EVERY_ORG_API_KEY,
        take: 50, // Request more charities
        causes: category === "featured" ? "environment,health,education" : undefined,
      },
    });

    console.log("Raw API response:", response.data);

    if (!response.data || !response.data.nonprofits) {
      console.error("Invalid response format:", response.data);
      throw new Error("Invalid API response format");
    }

    const charities = response.data.nonprofits.map((nonprofit) => ({
      id: nonprofit.ein || nonprofit.id,
      name: nonprofit.name,
      description: nonprofit.description || nonprofit.tagline || "No description available",
      category: nonprofit.categories?.[0] || "Nonprofit",
      location: nonprofit.location || "Global",
      website: nonprofit.websiteUrl,
      imageUrl: nonprofit.logoUrl,
      organization: nonprofit.name,
      coverImageUrl: nonprofit.coverImageUrl || nonprofit.logoUrl,
      matchedTerms: nonprofit.tags || [],
      slug: nonprofit.slug,
      profileUrl: `https://www.every.org/${nonprofit.slug}#donate`,
    }));

    console.log("Processed charities:", charities);

    return {
      success: true,
      data: charities,
      hasMore: response.data.hasMore || false,
    };
  } catch (error) {
    console.error("Error fetching charities:", error);
    return {
      success: false,
      error: "Failed to fetch charities",
      details: error.message,
    };
  }
});
