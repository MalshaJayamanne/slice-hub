import React,{useEffect,useState} from "react";
import {useParams} from "react-router-dom";
import restaurantAPI from "../api/restaurantapi";

const RestaurantDetails = () => {

  const {id} = useParams();

  const [restaurant,setRestaurant] = useState(null);

  useEffect(()=>{

    const fetchRestaurant = async ()=>{

        const res = await restaurantAPI.getRestaurant(id);

        setRestaurant(res.data.restaurant);

    };

    fetchRestaurant();

  },[id]);

  if(!restaurant) return <p>Loading...</p>;

  return(

    <div className="restaurant-details">

      <img src={restaurant.image} alt={restaurant.name}/>

      <h1>{restaurant.name}</h1>

      <p>{restaurant.category}</p>

      <p>{restaurant.description}</p>

    </div>

  );

};

export default RestaurantDetails;