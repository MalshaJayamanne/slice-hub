
import Food from "../models/Food.js";

export const createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json(food);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFoodsByRestaurant = async (req, res) => {
  try {
    const foods = await Food.find({
      restaurant: req.params.id,
    });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate("restaurant");
    res.json(food);
  } catch (err) {
    res.status(404).json({ message: "Food not found" });
  }
};

export const updateFood = async (req, res) => {
  const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(food);
};

export const deleteFood = async (req, res) => {
  await Food.findByIdAndDelete(req.params.id);
  res.json({ message: "Food deleted" });
};

export const searchFoods = async (req, res) => {
  const query = req.query.q;

  const foods = await Food.find({
    name: { $regex: query, $options: "i" },
  });

  res.json(foods);
};