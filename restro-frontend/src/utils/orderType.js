export const getOrderType = (record) => {
    const orderTypes = {
      pickup: "PICKUP",
      online: "ONLINE ORDER",
      dine_in: "DINE-IN"  // Default case
    };
  
    // Return the corresponding value, or default to "DINE-IN"
    return orderTypes[record] || "DINE-IN";
  };