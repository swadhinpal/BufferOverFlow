// PostVisited.js
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import hljs from 'highlight.js'; // Import highlight.js
import 'highlight.js/styles/github.css'; // Import a highlight.js theme

const PostVisited = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { email, content, code } = location.state || {}; // Access email, content, and code from the state

  return (
    <div>
      <h2>Post Details for Post ID: {postId}</h2>
      <h3>Posted by: {content.email}</h3>
      <p><strong>Posted on:</strong> {new Date(content.time).toLocaleString()}</p>
      <p><strong>Content:</strong></p>
      <p style={{ whiteSpace: 'pre-wrap' }}>{content.text}</p> {/* Preserves newline and spacing */}
      
      {code && (
        <div>
          <h4>Code:</h4>
          <pre>
            <code className={`language-${content.filename?.split('.').pop()}`}>
              {code}
            </code>
          </pre>
        </div>
      )}

      <button onClick={() => navigate('/notifications', { state: { email } })}>Back to Notifications</button>
      <button onClick={() => navigate('/dashboard', { state: { email } })}>Back to Dashboard</button>
    </div>
  );
};

export default PostVisited;
