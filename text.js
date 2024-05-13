[
  {
    $group: {
      _id: null,
      avgFoodRating: {
        $avg: "$foodRating",
      },
      avgserviceRating: {
        $avg: "$serviceRating",
      },
      avgambienceRating: {
        $avg: "$ambienceRating",
      },
      avgfanclubinteractionRating: {
        $avg: "$fanclubinteractionRating",
      },
      overallRating: {
        $avg: "$avgRating",
      },
    },
  },
][
  ({
    $match: {
      status: 1,
    },
  },
  {
    $group: {
      _id: null,
      totalReviews: { $sum: 1 },

      oneStarCount: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ["$foodRating", 1] },
                { $eq: ["$serviceRating", 1] },
                { $eq: ["$ambienceRating", 1] },
                { $eq: ["$fanclubinteractionRating", 1] },
              ],
            },
            1,
            0,
          ],
        },
      },
      twoStarCount: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ["$foodRating", 2] },
                { $eq: ["$serviceRating", 2] },
                { $eq: ["$ambienceRating", 2] },
                { $eq: ["$fanclubinteractionRating", 2] },
              ],
            },
            1,
            0,
          ],
        },
      },
      threeStarCount: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ["$foodRating", 3] },
                { $eq: ["$serviceRating", 3] },
                { $eq: ["$ambienceRating", 3] },
                { $eq: ["$fanclubinteractionRating", 3] },
              ],
            },
            1,
            0,
          ],
        },
      },
      fourStarCount: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ["$foodRating", 4] },
                { $eq: ["$serviceRating", 4] },
                { $eq: ["$ambienceRating", 4] },
                { $eq: ["$fanclubinteractionRating", 4] },
              ],
            },
            1,
            0,
          ],
        },
      },
      fiveStarCount: {
        $sum: {
          $cond: [
            {
              $or: [
                { $eq: ["$foodRating", 5] },
                { $eq: ["$serviceRating", 5] },
                { $eq: ["$ambienceRating", 5] },
                { $eq: ["$fanclubinteractionRating", 5] },
              ],
            },
            1,
            0,
          ],
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      totalReviews: 1,
      oneStarPercentage: {
        $multiply: [{ $divide: ["$oneStarCount", "$totalReviews"] }, 100],
      },
      twoStarPercentage: {
        $multiply: [{ $divide: ["$twoStarCount", "$totalReviews"] }, 100],
      },
      threeStarPercentage: {
        $multiply: [{ $divide: ["$threeStarCount", "$totalReviews"] }, 100],
      },
      fourStarPercentage: {
        $multiply: [{ $divide: ["$fourStarCount", "$totalReviews"] }, 100],
      },
      fiveStarPercentage: {
        $multiply: [{ $divide: ["$fiveStarCount", "$totalReviews"] }, 100],
      },
    },
  })
][
  // User Profile Stats Pipeline

  ({
    $match: {
      userId: ObjectId("660f8459c814801176007a69"),
    },
  },
  {
    $group: {
      _id: null,
      number_event: {
        $sum: 1,
      },
    },
  })
][
  ({
    $match: {
      userId: ObjectId("660f8459c814801176007a69"),
    },
  },
  {
    $group: {
      _id: null,
      Amount_Spent: {
        $sum: "$totalPrice",
      },
    },
  })
];

// for post the coupon code and discount (reminder)
if (appliedCoupon.discount_rate < 0 || appliedCoupon.discount_rate > 100) {
  console.log("Discount percentage should be between 0 and 100.");
  return res
    .status(400)
    .json({ message: "Discount percentage should be between 0 and 100." });
}
