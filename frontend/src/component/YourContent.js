import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import hljs from 'highlight.js'; // Import highlight.js
import 'highlight.js/styles/github.css'; // Import a highlight.js theme
import './YourContent.css'; // Create a CSS file for styling

const YourContent = () => {
  const location = useLocation();
  const { email } = location.state || {}; // Get the email from the location state
  const [userContents, setUserContents] = useState([]); // State to store user content

  useEffect(() => {
    const fetchUserContents = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from local storage
        const response = await fetch(`http://localhost:4000/api/getContents?email=${encodeURIComponent(email)}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the headers
          },
        });
        
        const data = await response.json();

        if (response.ok) {
          // Sort userContents by time descending
          const sortedUserContents = data.contents.sort((a, b) => new Date(b.time) - new Date(a.time));
          setUserContents(sortedUserContents); // Update state with fetched user contents
        } else {
          console.error('Error fetching user contents:', data.message);
        }
      } catch (error) {
        console.error('Error fetching user contents:', error);
      }
    };

    fetchUserContents();
  }, [email]);

  useEffect(() => {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      hljs.highlightBlock(block); // Highlight the code block
    });
  }, [userContents]); // Run the effect when userContents changes

  // Function to format text with line breaks
  const formatText = (text) => {
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="your-content">
      <h2>Your Content</h2>
      <div className="content-list">
        {userContents.length > 0 ? ( // Check if there are contents to display
          userContents.map((content, index) => (
            <div key={index} className="content-item">
              <h3>Posted on: {new Date(content.time).toLocaleString()}</h3>
              {/* Separate the label and the content */}
              <p>
                <strong>Content:</strong>
              </p>
              <p>{formatText(content.text)}</p> {/* Format the text with line breaks */}
              {content.filename && (
                <div>
                  <h4>Code File:</h4>
                  <pre>
                    <code className={`language-${content.filename.split('.').pop()}`}>
                      {content.code}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No content available.</p> // Display a message if no content
        )}
      </div>
    </div>
  );
};

export default YourContent;
