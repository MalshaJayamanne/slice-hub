import React from "react";

const RestaurantFilter = ({category,setCategory}) => {

  return(

    <select
      value={category}
      onChange={(e)=>setCategory(e.target.value)}
      className="filter-dropdown"
    >

      <option value="">All</option>
      <option value="Italian">Italian</option>
      <option value="Sri Lankan">Sri Lankan</option>
      <option value="Indian">Indian</option>
      <option value="Chinese">Chinese</option>
      <option value="Fast Food">Fast Food</option>

    </select>

  );

};

export default RestaurantFilter;