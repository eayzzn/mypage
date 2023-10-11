import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  useEffect(() => {
    document.title = "eayzzn";
  }, []);

  

  return (
    <div>
      
      <div className="Head">
        <h1>eayzzn - Homepage</h1>
      </div>
      <div className="App">
        <h1>hallo test 11111111111</h1>
        <h2>Hier könnte Werbung stehen</h2>
        <h3>4</h3>
      </div>
      <div className="Banner">
        <h1>hallo test 11111111111</h1>
        <h2>Hier könnte Werbung stehen</h2>
        <h3>4</h3>
      </div>

    </div>


  );

  
}

export default App;
