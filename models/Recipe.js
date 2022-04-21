const mongoose = require("mongoose");
const Schema = mongoose.Schema
const recipeSchema = new mongoose.Schema(
  {
    // userid: {
    //   type: String,
    //   required: true,
    // },
    name: {
      type: String,
      required: [true, "Please Enter the Recipe Name"],
    },
    ingredients: {
      type: Array,
      required: [true, "Please Enter the Ingredients"],
    },
    category: {
      type: String,
      enum: ["Thai", "American", "Chinese", "Mexican", "Indian"],
      required: [true, "Please Enter the Recipe Category"],
    },
    instructions: {
      type: String,
      required: [true, "Please Enter the Recipe Instructions"],
    },
    image: {
      type: String,
      required: [true, "Please Enter the Recipe Image"],
    },
    author: {
        type: String,
        required: [false, "Please enter author of the recipe"],
        ref: "newuser"
    },
    authorId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "newuser",
    },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("recipe", recipeSchema);

module.exports = Recipe;