import './App.css';
import Nav from './component/nav';
import Home from './component/home';
import Register from './component/Register';
import UserProfile from './component/UserProfile';
import Login from './component/Login';
import UserDashboard from './component/UserDashboard';
import PostContent from './component/PostContent';
import YourContent from './component/YourContent';
import Notifications from './component/Notifications';
import PostVisited from './component/PostVisited';


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
    <div className="App">
      <header className="App-header">
      
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/postContent" element={<PostContent/>} />
        <Route path="/yourContent" element={<YourContent />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/postVisited" element={<PostVisited />} />
       </Routes>
        
       </header> 
        
    </div>
    </Router>
  );
}

export default App;
