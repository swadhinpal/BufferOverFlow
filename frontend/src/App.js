//import logo from './logo.svg';
import './App.css';
import Nav from './component/nav';
import Home from './component/home';
//import Tweet from './component/tweet';
//import Input from './component/Input';
//import Input1 from './component/Input1';
//import Output from './component/output';
//import Output1 from './component/output1';
import Register from './component/Register';
//import GenerateRating from './component/GenerateRating';
//import GenerateSolution from './component/GenerateSolution';
import VerifyOtp from './component/VerifyOtp.js';
import UserProfile from './component/UserProfile';
import ForgotPassword from './component/ForgotPassword';
import UpdatePassword from './component/UpdatePassword';
import Login from './component/Login';
import UserDashboard from './component/UserDashboard';
import PostContent from './component/PostContent';
import YourContent from './component/YourContent';
/*import Pay from './component/pay';
import PaymentSuccess from './component/PaymentSuccess';
import Fail from './component/Fail';*/

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/postContent" element={<PostContent/>} />
        <Route path="/yourContent" element={<YourContent />} />
       </Routes>
        
       </header> 
        
    </div>
    </Router>
  );
}

export default App;
