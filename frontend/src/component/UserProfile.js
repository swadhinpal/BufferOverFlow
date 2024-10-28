/*

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation to access navigation state
import './UserProfile.css'; // Import the CSS file for styling

const UserProfile = () => {
  const location = useLocation(); // Access the location object
  const { email } = location.state || {}; // Destructure the email from location state
  
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('C');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (question.trim() === '' && code.trim() === '') {
      setError('You must enter either a question or code.');
      return;
    }

    if (code.trim() !== '' && question.trim() === '') {
      setError('You cannot post only code. Please enter a question as well.');
      return;
    }

    // Create the new post object
    const newPost = {
      email, // Use the email from navigation state
      question: question.trim(),
      code: code.trim(),
      language: language,
    };

    // Add the new post to the posts array
    setPosts([...posts, newPost]);

    // Clear the input fields
    setQuestion('');
    setCode('');
    setLanguage('C');
    setError('');

    // Prepare data to send to backend
    const uploadData = {
      email, // Use the email from navigation state
      text: question.trim(), // Assuming the question is the text you want to upload
      code: code.trim(),
    };

    // Send the data to the backend
    try {
      const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      });

      if (!response.ok) {
        throw new Error('Error uploading data to the server');
      }

      const data = await response.json();
      console.log('Data uploaded successfully:', data);
    } catch (uploadError) {
      console.error('Error uploading data:', uploadError);
      setError('Error uploading data. Please try again.');
    }
  };

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <input
          type="text"
          placeholder="Ask your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <textarea
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="C">C</option>
          <option value="C++">C++</option>
          <option value="C#">C#</option>
          <option value="Java">Java</option>
          <option value="Others">Others</option>
        </select>
        <button type="submit">Post</button>
        {error && <p className="error">{error}</p>}
      </form>
      <div className="posts">
        {posts.map((post, index) => (
          <div key={index} className="post">
            <h3>{post.question}</h3>
            <pre className="code">
              <code>{post.code}</code>
            </pre>
            <p className="language">Language: {post.language}</p>
            <p className="email">Email: {post.email}</p> {/* Display email *//*}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;*/

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation to access navigation state
import './UserProfile.css'; // Import the CSS file for styling

const UserProfile = () => {
  const location = useLocation(); // Access the location object
  const { email } = location.state || {}; // Destructure the email from location state

  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('C'); // State to store selected language
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (question.trim() === '' && code.trim() === '') {
      setError('You must enter either a question or code.');
      return;
    }

    if (code.trim() !== '' && question.trim() === '') {
      setError('You cannot post only code. Please enter a question as well.');
      return;
    }

    // Create the new post object
    const newPost = {
      email, // Use the email from navigation state
      question: question.trim(),
      code: code.trim(),
      language, // Use the selected language
    };

    // Add the new post to the posts array
    setPosts([...posts, newPost]);

    // Clear the input fields
    setQuestion('');
    setCode('');
    setLanguage('C');
    setError('');

    // Prepare data to send to backend
    const uploadData = {
      email, // Use the email from navigation state
      text: question.trim(), // Assuming the question is the text you want to upload
      code: code.trim(),
      language, // Send selected language to the backend
    };

    // Send the data to the backend
    try {
      const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData),
      });

      if (!response.ok) {
        throw new Error('Error uploading data to the server');
      }

      const data = await response.json();
      console.log('Data uploaded successfully:', data);
    } catch (uploadError) {
      console.error('Error uploading data:', uploadError);
      setError('Error uploading data. Please try again.');
    }
  };

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit} className="post-form">
        <input
          type="text"
          placeholder="Ask your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <textarea
          placeholder="Paste your code here..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {/* Dropdown for language selection */}
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="C">C</option>
          <option value="C++">C++</option>
          <option value="C#">C#</option>
          <option value="Java">Java</option>
          <option value="Others">Others</option>
        </select>
        <button type="submit">Post</button>
        {error && <p className="error">{error}</p>}
      </form>
      <div className="posts">
        {posts.map((post, index) => (
          <div key={index} className="post">
            <h3>{post.question}</h3>
            <pre className="code">
              <code>{post.code}</code>
            </pre>
            <p className="language">Language: {post.language}</p>
            <p className="email">Email: {post.email}</p> {/* Display email */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;


