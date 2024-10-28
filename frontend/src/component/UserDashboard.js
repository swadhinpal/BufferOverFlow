/*

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate(); // Use useNavigate for navigation
  const location = useLocation(); // Access the location object
  const { email } = location.state || {}; // Destructure the email from location state
  const [contents, setContents] = useState([]); // State to store contents

  useEffect(() => {
    // Fetch user content on component mount
    const fetchUserContents = async () => {
      try {
        const response = await fetch(`http://localhost:4000/getAllContents?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setContents(data.contents); // Update state with fetched contents
        } else {
          console.error('Error fetching contents:', data.message);
        }
      } catch (error) {
        console.error('Error fetching contents:', error);
      }
    };

    fetchUserContents();
  }, [email]);

  const handlePostNow = () => {
    navigate('/postContent', { state: { email } }); // Pass the actual user email
  };

  const handleYourContent = () => {
    navigate('/yourContent', { state: { email } }); // Pass email to YourContent page
  };

  return (
    <div className="user-dashboard">
      <h2>User Dashboard</h2>
      <nav>
        <button onClick={handlePostNow}>Post Now</button>
        <button onClick={handleYourContent}>Your Content</button>
        <button onClick={() => console.log('Navigate to Notifications')}>Notifications</button>
      </nav>
      <div className="content-list">
        {contents.map((content, index) => (
          <div key={index} className="content-item">
            <h3>Posted by: {content.email}</h3>
            <p><strong>Posted on:</strong> {new Date(content.time).toLocaleString()}</p>
            <p><strong>Content:</strong> {content.text}</p>
            {content.code && (
              <div>
                <h4>Code:</h4>
                <pre>{content.code}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;*/

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchUserContents = async () => {
      console.log("Fetching contents for email:", email); // Debug log
      try {
        const response = await fetch(`http://localhost:4000/getAllContents?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          console.log('Fetched contents:', data.contents); // Debug log
          setContents(data.contents);
        } else {
          console.error('Error fetching contents:', data.message);
        }
      } catch (error) {
        console.error('Error fetching contents:', error);
      }
    };

    fetchUserContents();
  }, [email]);

  const handlePostNow = () => {
    navigate('/postContent', { state: { email } });
  };

  const handleYourContent = () => {
    navigate('/yourContent', { state: { email } });
  };

  return (
    <div className="user-dashboard">
      <h2>User Dashboard</h2>
      <nav>
        <button onClick={handlePostNow}>Post Now</button>
        <button onClick={handleYourContent}>Your Content</button>
        <button onClick={() => console.log('Navigate to Notifications')}>Notifications</button>
      </nav>
      <div className="content-list">
        {contents.length > 0 ? (
          contents.map((content, index) => (
            <div key={index} className="content-item">
              <h3>Posted by: {content.email}</h3>
              <p><strong>Posted on:</strong> {new Date(content.time).toLocaleString()}</p>
              <p><strong>Content:</strong> {content.text}</p>
              {content.code && (
                <div>
                  <h4>Code:</h4>
                  <pre>{content.code}</pre>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No contents available.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

