import React from 'react';
import './Header.css'; // Import styles for the Header component

function Header() {
  return (
    <div>
      <header className="header">
      <a href='/'>Nuclei Template Finder</a> 
        <h1>Search 1000's of Community Nuclei Templates</h1>
        <p>From 100+ Public Github Repos</p>
      </header>
    </div>
  );
}

export default Header;
