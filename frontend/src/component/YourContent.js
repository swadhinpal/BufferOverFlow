// YourContent.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './YourContent.css'; // Create a CSS file for styling

const YourContent = () => {
  const location = useLocation();
  const { email } = location.state || {}; // Get the email from the location state
  const [userContents, setUserContents] = useState([]); // State to store user content

  useEffect(() => {
    const fetchUserContents = async () => {
      try {
        const response = await fetch(`http://localhost:4000/getContents?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (response.ok) {
          setUserContents(data.contents); // Update state with fetched user contents
        } else {
          console.error('Error fetching user contents:', data.message);
        }
      } catch (error) {
        console.error('Error fetching user contents:', error);
      }
    };

    fetchUserContents();
  }, [email]);

  return (
    <div className="your-content">
      <h2>Your Content</h2>
      <div className="content-list">
        {userContents.map((content, index) => (
          <div key={index} className="content-item">
            <h3>Posted on: {new Date(content.time).toLocaleString()}</h3>
            <p><strong>Content:</strong> {content.text}</p>
            {content.filename && (
              <div>
                <h4>Code File:</h4>
                <pre>{content.code}</pre> {/* Show code directly */}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourContent;
