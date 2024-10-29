/*
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
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
        const token = localStorage.getItem('token'); // Retrieve the token from local storage
        const response = await fetch(`http://localhost:4000/api/getAllContents?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        });

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

  useEffect(() => {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      hljs.highlightBlock(block); // Highlight the code block
    });
  }, [contents]); // Run the effect when contents change

  const handlePostNow = () => {
    navigate('/postContent', { state: { email } });
  };

  const handleYourContent = () => {
    navigate('/yourContent', { state: { email } });
  };

  const handleNotifications = () => {
    navigate('/notifications', { state: { email } }); // Pass email to Notifications page
  };

  return (
    <div className="user-dashboard">
      <h2>User Dashboard</h2>
      <nav>
        <button onClick={handlePostNow}>Post Now</button>
        <button onClick={handleYourContent}>Your Content</button>
        <button onClick={handleNotifications}>Notifications</button>
      </nav>
      <div className="content-list">
        {contents.length > 0 ? (
          contents.map((content, index) => (
            <div key={index} className="content-item">
              <h3>Posted by: {content.email}</h3>
              <p><strong>Posted on:</strong> {new Date(content.time).toLocaleString()}</p>
              <p><strong>Content:</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{content.text}</p>
              {content.code && (
                <div>
                  <h4>Code:</h4>
                  <pre>
                    <code className={`language-${content.filename?.split('.').pop()}`}>
                      {content.code}
                    </code>
                  </pre>
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

export default UserDashboard;*/
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};
  const [contents, setContents] = useState([]);

  useEffect(() => {
    const fetchUserContents = async () => {
      console.log("Fetching contents for email:", email);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:4000/api/getAllContents?email=${encodeURIComponent(email)}`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (response.ok) {
          console.log('Fetched contents:', data.contents);
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

  useEffect(() => {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => hljs.highlightBlock(block));
  }, [contents]);

  const handlePostNow = () => navigate('/postContent', { state: { email } });
  const handleYourContent = () => navigate('/yourContent', { state: { email } });
  const handleNotifications = () => navigate('/notifications', { state: { email } });
  const handleLogout = () => navigate('/');

  return (
    <div className="user-dashboard">
      <nav1>
        <button className="dashboard-button" onClick={handlePostNow}>
          Post Now
        </button>
        <button className="dashboard-button" onClick={handleYourContent}>
          Your Content
        </button>
        <button className="dashboard-button" onClick={handleNotifications}>
          Notifications
        </button>
        <button className="dashboard-button" onClick={handleLogout}>
          Logout
        </button>
      </nav1>

      <div className="content-list">
        {contents.length > 0 ? (
          contents.map((content, index) => (
            <div key={index} className="content-item">
              <h3>{content.email}</h3>
              <p className="date">
                Posted on: {new Date(content.time).toLocaleString()}
              </p>
              <p><strong>Content:</strong></p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{content.text}</p>
              {content.code && (
                <pre>
                  <code className={`language-${content.filename?.split('.').pop()}`}>
                    {content.code}
                  </code>
                </pre>
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
