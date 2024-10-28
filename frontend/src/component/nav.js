// src/components/Nav.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Nav.css'; // Import your CSS file

function Nav() {
    return (
        <nav>
            <div className="nav-links">
                <Link to='/Login' className="nav-link">Login</Link> {/* Only showing the Login link */}
            </div>
        </nav>
    );
}

export default Nav;
