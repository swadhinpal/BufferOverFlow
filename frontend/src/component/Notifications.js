// Notifications.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
  const location = useLocation();
  const { email } = location.state || {};
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/notification?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        setNotifications((data.notifications || []).reverse());
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [email]);

  // Notifications.js
const handleNotificationClick = async (postId) => {
  // Call the API to mark the notification as clicked and get post content
  const response = await fetch('http://localhost:4000/api/notificationClicked', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, postId }),
  });

  if (response.ok) {
    const { content, code } = await response.json(); // Get content and code from the response

    // Navigate to the postVisited page with the post content, code, and email
    navigate('/postVisited', { state: { postId, email, content, code } });
  } else {
    console.error('Error fetching post content:', await response.json());
  }
};

  return (
    <div className="notifications">
      <h2>Notifications</h2>
      {notifications.length > 0 ? (
        notifications.map((notif, index) => (
          <div key={index} className="notification-item" onClick={() => handleNotificationClick(notif.postId)}>
            <p>{notif.email} has posted.</p>
          </div>
        ))
      ) : (
        <p>No new notifications.</p>
      )}
    </div>
  );
};

export default Notifications;
