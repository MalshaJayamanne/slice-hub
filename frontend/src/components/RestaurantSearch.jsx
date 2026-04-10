import React from "react";

const RestaurantSearch = ({search,setSearch}) => {

  return(

    <input
      type="text"
      placeholder="Search restaurants..."
      value={search}
      onChange={(e)=>setSearch(e.target.value)}
      className="search-bar"
    />

  );

};

export default RestaurantSearch;