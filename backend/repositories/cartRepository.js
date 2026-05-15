import Cart from "../models/Cart.js";

const cartPopulate = {
  path: "items.productId",
  select:
    "name brand category price originalPrice image images sizes stock description isLatest isBestseller",
};

export const findCartByUserId = (userId) => Cart.findOne({ userId }).populate(cartPopulate);

export const findRawCartByUserId = (userId) => Cart.findOne({ userId });

export const upsertCart = ({ userId, items, totalItems, subtotal, discount = 0, finalTotal }) =>
  Cart.findOneAndUpdate(
    { userId },
    {
      $set: {
        items,
        totalItems,
        subtotal,
        discount,
        finalTotal,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).populate(cartPopulate);
