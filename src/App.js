
import React from 'react';
import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import MyForm from './components/MyForm';
import Login from './components/Login';
import Homepage from './components/Homepage/Homepage';
import Election from './components/Election/App';


function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/Homepage" element={<Homepage/>} />
        <Route path="/Election" element={<Election/>} />
        <Route path="/MyForm" element={<MyForm/>} />
      </Routes>
    </Router>
  );
}

export default App;

