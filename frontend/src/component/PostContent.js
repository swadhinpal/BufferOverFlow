import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import './PostContent.css'; // Import the CSS file for styling

const PostContent = () => {
  const location = useLocation(); // Access the location object
  const navigate = useNavigate(); // Use useNavigate for navigation
  const { email } = location.state || {}; // Destructure the email from location state

  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('C'); // State to store selected language
  const [error, setError] = useState('');

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

      // Redirect to the UserDashboard page after successful post
      navigate('/userDashboard', { state: { email } }); // Pass email to the UserDashboard
    } catch (uploadError) {
      console.error('Error uploading data:', uploadError);
      setError('Error uploading data. Please try again.');
    }
  };

  // Handle navigation back to the User Dashboard
  const handleBackToDashboard = () => {
    navigate('/userDashboard', { state: { email } }); // Pass email to the UserDashboard
  };

  return (
    <div className="post-content">
      <h2>Post Content</h2>
      <button onClick={handleBackToDashboard} className="back-button">Back to Dashboard</button>
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
    </div>
  );
};

export default PostContent;
