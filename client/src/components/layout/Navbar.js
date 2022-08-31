import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { logout } from "../../actions/auth";
import { connect } from "react-redux";

const Navbar = ({ auth: { isAuthenticated, loading }, logout }) => {
  const authLinks = (
    <ul>
      <li>
        <Link to="/users">
          <i className="fas fa-users" /> <span>Agents</span>
        </Link>
      </li>
      <li>
        <Link to="/register">
          <i className="fas fa-user-plus" /> <span>Register New Agent</span>
        </Link>
      </li>
      <li>
        <Link to="/tasks/me">
          <i className="fas fa-tasks" /> <span>My Tasks</span>
        </Link>
      </li>
      <li>
        <Link to="/tasks/brokerage">
          <i className="fas fa-tasks" /> <span>Brokerage Tasks</span>
        </Link>
      </li>
      <li>
        <Link to="/templates">
          <i className="fas fa-clipboard" /> <span>Brokerage Templates</span>
        </Link>
      </li>
      <li>
        <Link to="#!" onClick={logout}>
          <i className="fas fa-sign-out-alt" />
          <span>Logout</span>
        </Link>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/login">Login</Link>
      </li>
      <li>
        <Link to="/about">
          About <i className="fas fa-question" />
        </Link>
      </li>
    </ul>
  );
  return (
    <nav className="navbar bg-dark">
      <h1>
        <Link to="/">REasy</Link>
      </h1>
      {!loading && (
        <Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>
      )}
    </nav>
  );
};

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logout }
)(Navbar);
