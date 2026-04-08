import React, { useEffect, useState } from "react";
import restaurantAPI from "../api/restaurantapi";

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const fetchRestaurants = async () => {
    setLoading(true);

    try {
      const res = await restaurantAPI.getRestaurants();

      console.log("Restaurants:", res.data);

      setRestaurants(res.data.restaurants || res.data);

    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));

    try {
      if (action === "approve" || action === "reject") {

        await restaurantAPI.updateStatus(
          id,
          action === "approve" ? "approved" : "rejected"
        );

        fetchRestaurants();

      } else if (action === "delete") {

        await restaurantAPI.deleteRestaurant(id);

        setRestaurants((prev) =>
          prev.filter((r) => r._id !== id)
        );

      }
    } catch (error) {
      console.error(`Failed to ${action} restaurant:`, error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return <p>Loading restaurants...</p>;
  }

  return (
    <div className="admin-container">
      <h1>Admin Restaurant Management</h1>

      <table className="admin-table">

        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {restaurants.length === 0 && (
            <tr>
              <td colSpan="3">No restaurants found</td>
            </tr>
          )}

          {restaurants.map((r) => (
            <tr key={r._id}>
              <td>{r.name}</td>
              <td>{r.category}</td>

              <td>
                <button className="admin-btn">
                  Edit
                </button>

                <button
                  className="admin-btn btn-delete"
                  onClick={() => handleAction(r._id, "delete")}
                  disabled={actionLoading[r._id]}
                >
                  Delete
                </button>

                <button
                  className="admin-btn btn-approve"
                  onClick={() => handleAction(r._id, "approve")}
                  disabled={actionLoading[r._id]}
                >
                  Approve
                </button>

                <button
                  className="admin-btn btn-reject"
                  onClick={() => handleAction(r._id, "reject")}
                  disabled={actionLoading[r._id]}
                >
                  Reject
                </button>
              </td>

            </tr>
          ))}

        </tbody>
      </table>
    </div>
  );
};

export default AdminRestaurants;