/*import React, { useEffect, useState } from "react";
import RestaurantSearch from "../components/RestaurantSearch";
import RestaurantFilter from "../components/RestaurantFilter";

// Dummy restaurant data
const dummyRestaurants = [
  {
    _id: "1",
    name: "Pizza Hut",
    category: "Pizza",
    rating: 4.2,
    image:
      "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400",
    deliveryTime: "20-30 min",
  },
  {
    _id: "2",
    name: "Spice Indian",
    category: "Indian",
    rating: 4.5,
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400",
    deliveryTime: "25-35 min",
  },
  {
    _id: "3",
    name: "Curry Kottu House",
    category: "Sri Lankan",
    rating: 4.3,
    image:
      "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&h=400",
    deliveryTime: "30-40 min",
  },
  {
    _id: "4",
    name: "Dragon Wok",
    category: "Chinese",
    rating: 4.0,
    image:
      "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400",
    deliveryTime: "20-30 min",
  },
  {
    _id: "5",
    name: "Bella Italia",
    category: "Italian",
    rating: 4.7,
    image:
      "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400",
    deliveryTime: "25-35 min",
  },
  {
    _id: "6",
    name: "Sushi Master",
    category: "Japanese",
    rating: 4.8,
    image:
      "https://images.pexels.com/photos/2098087/pexels-photo-2098087.jpeg?auto=compress&cs=tinysrgb&w=400",
    deliveryTime: "30-40 min",
  },
  {
    _id: "7",
    name: "Taco Fiesta",
    category: "Mexican",
    rating: 4.4,
    image:
      "https://images.pexels.com/photos/4611989/pexels-photo-4611989.jpeg?auto=compress&cs=tinysrgb&w=400",
    deliveryTime: "18-28 min",
  },
];

const RestaurantsDummy = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = [...new Set(dummyRestaurants.map((r) => r.category))];

  useEffect(() => {
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      let filtered = dummyRestaurants;

      if (search) {
        filtered = filtered.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (category) {
        filtered = filtered.filter(
          (r) => r.category.toLowerCase() === category.toLowerCase()
        );
      }

      setRestaurants(filtered);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [search, category]);

  if (loading)
    return <p style={{ color: "var(--contrast-dark)" }}>Loading restaurants...</p>;
  if (error)
    return <p style={{ color: "var(--primary-red)" }}>{error}</p>;
  if (restaurants.length === 0)
    return <p style={{ color: "var(--contrast-dark)" }}>No restaurants found</p>;

  return (
    <div
      className="restaurants-page"
      style={{
        padding: "20px",
        fontFamily: "Arial",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: "15px", color: "var(--contrast-dark)" }}>
        Restaurants
      </h1>

      <RestaurantSearch search={search} setSearch={setSearch} />

      
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: "10px",
          margin: "15px 0",
          paddingBottom: "5px",
        }}
      >
        <button
          onClick={() => setCategory("")}
          style={{
            padding: "8px 15px",
            borderRadius: "20px",
            border: category === "" ? `2px solid var(--primary-red)` : "1px solid #ccc",
            background: category === "" ? "var(--secondary-orange)" : "#fff",
            color: category === "" ? "#fff" : "var(--contrast-dark)",
            cursor: "pointer",
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "8px 15px",
              borderRadius: "20px",
              border: category === cat ? `2px solid var(--primary-red)` : "1px solid #ccc",
              background: category === cat ? "var(--secondary-orange)" : "#fff",
              color: category === cat ? "#fff" : "var(--contrast-dark)",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <RestaurantFilter category={category} setCategory={setCategory} />

    
      <div
        className="restaurant-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {restaurants.map((restaurant) => (
          <div
            key={restaurant._id}
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              backgroundColor: "#fff",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
          >
            <img
              src={restaurant.image}
              alt={restaurant.name}
              style={{ width: "100%", height: "150px", objectFit: "cover" }}
            />
            <div style={{ padding: "10px" }}>
              <h3
                style={{
                  margin: "0 0 5px 0",
                  fontSize: "18px",
                  color: "var(--contrast-dark)",
                }}
              >
                {restaurant.name}
              </h3>
              <p
                style={{
                  margin: "0 0 5px 0",
                  fontSize: "14px",
                  color: "var(--contrast-dark)",
                }}
              >
                <span
                  style={{
                    background: "var(--primary-red)",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    marginRight: "5px",
                    fontSize: "12px",
                  }}
                >
                  {restaurant.category}
                </span>
                • {restaurant.deliveryTime}
              </p>
              <p
                style={{
                  margin: "0",
                  color: "var(--contrast-dark)",
                  fontSize: "12px",
                }}
              >
                ⭐ {restaurant.rating}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantsDummy;*/

import RestaurantCard from "../components/RestaurantCard";

const RestaurantList = () => {

  // Dummy
  const restaurants = [
    {
      _id: "1",
      name: "Pizza Hut",
      rating: 4.6,
      deliveryTime: "30 min",
      categories: ["Pizza", "Italian"],
      image: "https://picsum.photos/400/200?1"
    },
    {
      _id: "2",
      name: "Burger King",
      rating: 4.4,
      deliveryTime: "25 min",
      categories: ["Burgers", "Fast Food"],
      image: "https://picsum.photos/400/200?2"
    },
    {
      _id: "3",
      name: "KFC",
      rating: 4.5,
      deliveryTime: "20 min",
      categories: ["Chicken", "Fast Food"],
      image: "https://picsum.photos/400/200?3"
    }
  ];

  return (
    <div className="restaurant-page">
      <h2 className="section-title">Popular Restaurants</h2>

      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant._id}
            restaurant={restaurant}
          />
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;