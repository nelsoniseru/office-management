import React, { Fragment, useState } from "react";
import { connect } from "react-redux";
import { setAlert } from "../../actions/alert";
import { register } from "../../actions/auth";
import PropTypes from "prop-types";

const Register = ({ setAlert, register, isAuthenticated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    brokerage: "",
    inCoaching: false,
    onTeam: false,
    password: "",
    password2: ""
  });

  const {
    name,
    email,
    phone,
    brokerage,
    inCoaching,
    onTeam,
    password,
    password2
  } = formData;

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (password !== password2) {
      setAlert("Passwords do not match", "danger");
    } else {
      register({ name, email, brokerage, inCoaching, onTeam, phone, password });
    }
  };

  return (
    <Fragment>
      <div className="register-container">
        <h1 className="large text-primary">Agent Registration</h1>
        <p className="lead">
          <i className="fas fa-user" /> Register a New Agent
        </p>
        <form className="form" onSubmit={e => onSubmit(e)}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Name"
              name="name"
              value={name}
              onChange={e => onChange(e)}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={email}
              onChange={e => onChange(e)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Phone Number - Please format eg: 801-822-8325"
              name="phone"
              value={phone}
              onChange={e => onChange(e)}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Brokerage"
              name="brokerage"
              value={brokerage}
              onChange={e => onChange(e)}
            />
          </div>
          <div className="form-group">
            <span style={{ fontWeight: "bold" }}>
              Is this agent in coaching? **This field defaults to no
            </span>
            <select
              name="inCoaching"
              value={inCoaching}
              onClick={e => onChange(e)}
              onChange={e => onChange(e)}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <span style={{ fontWeight: "bold" }}>
              Is this agent on a team? **This field defaults to no
            </span>
            <select
              name="onTeam"
              value={onTeam}
              onChange={e => onChange(e)}
              onClick={e => onChange(e)}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={e => onChange(e)}
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm Password"
              name="password2"
              value={password2}
              onChange={e => onChange(e)}
            />
          </div>
          <input
            type="submit"
            className="btn btn-kw"
            value="Register "
            style={{ color: "white" }}
          />
        </form>
      </div>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(
  mapStateToProps,
  { setAlert, register }
)(Register);
