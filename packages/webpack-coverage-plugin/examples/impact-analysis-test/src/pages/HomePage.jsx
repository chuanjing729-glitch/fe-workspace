// src/pages/HomePage.jsx
import React from 'react';
import Button from '../components/Button';
import { formatTitle } from '../utils/formatter';

const HomePage = () => {
  const handleButtonClick = () => {
    console.log('Button clicked');
  };

  const title = formatTitle('Home Page');

  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleButtonClick} variant="primary">
        Click Me
      </Button>
    </div>
  );
};

export default HomePage;