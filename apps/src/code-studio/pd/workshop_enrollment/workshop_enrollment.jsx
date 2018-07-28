/**
 * New workshop enrollment page
 */
import React, {PropTypes} from 'react';
import WorkshopDetails from './workshop_details';
import FacilitatorBio from './facilitator_bio';
import SignInPrompt from './sign_in_prompt';
import EnrollForm from './enroll_form';

export default class WorkshopEnrollment extends React.Component {
  static propTypes = {
    workshop: PropTypes.object,
    session_dates: PropTypes.arrayOf(PropTypes.string),
    enrollment: PropTypes.object,
    facilitators: PropTypes.arrayOf(PropTypes.object),
    logged_in: PropTypes.bool,
    sign_in_prompt_data: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      submissionStatus: "unsubmitted"
    };
  }

  onSubmissionComplete = (data) => {
    this.setState(data);
  };

  renderDuplicate() {
    return (
      <div>
        <h1>
          Thank you for registering
        </h1>
        <p>
          You are already registered, and should have received a confirmation email.
        </p>
        <p>
          If you need to cancel, click <a href={this.state.cancelUrl}>{this.state.cancelUrl}</a>
        </p>
      </div>
    );
  }

  renderOwn() {
    return (
      <div>
        <p>
          You are attempting to join your own <a href={this.state.workshopUrl}>workshop.</a>
        </p>
      </div>
    );
  }

  renderFull() {
    return (
      <div>
        <p>
          Sorry, this workshop is full.
        </p>
        <p>
          For more information, please contact the organizer: {this.props.workshop.organizer.email}
        </p>
      </div>
    );
  }

  renderClosed() {
    return (
      <div>
        <p>
          Sorry, this workshop is closed.
        </p>
        <p>
          For more information, please contact the organizer: {this.props.workshop.organizer.email}
        </p>
      </div>
    );
  }

  renderNotFound() {
    return (
      <div>
        <p>
          Sorry, this workshop could not be found.
        </p>
      </div>
    );
  }

  renderSuccess() {
    return (
      <div>
        <h1>
          Thank you for registering
        </h1>
        <p>
          You will receive a confirmation email. If you have any questions or need to
          request special accommodations, please reach out directly to the workshop
          organizer: {this.props.workshop.organizer.name} at {this.props.workshop.organizer.email}.
        </p>
        <p>
          If you need to cancel, click <a href={this.state.cancelUrl}>{this.state.cancelUrl}</a>
        </p>
        <br/>
        {!this.state.accountExists &&
          <div>
            <h1>
              Get a Head Start: Create Your Code.org Account
            </h1>
            <p>
              If you don’t have a Code.org account yet, click below
              to create one. You'll need a Code.org account on the day of the workshop.
              You'll use this account to manage your students and view their progress
              when you start teaching, so be sure to use the email you'll use when you
              teach.
            </p>

            <a href={this.state.signUpUrl}>
              <button className="primary">
                Create account now
              </button>
            </a>
          </div>
        }
      </div>
    );
  }

  render() {
    if (this.state.submissionStatus === "unsubmitted") {
      return (
        <div>
          <h1>
            {`Register for a ${this.props.workshop.course} workshop`}
          </h1>
          <p>
            Taught by Code.org facilitators who are experienced computer science educators,
            our workshops will prepare you to teach the Code.org curriculum.
          </p>
          <div className="container">
            <div className="row">
              {/* Left Column */}
              <div className ="span6">
                <WorkshopDetails
                  workshop={this.props.workshop}
                  session_dates={this.props.session_dates}
                />
                <h2>Facilitators</h2>
                {this.props.facilitators.map(facilitator => (
                  <FacilitatorBio
                    key={facilitator.email}
                    facilitator={facilitator}
                  />
                ))}
              </div>
              {/* Right Column */}
              <div className ="span6">
                <div className="row">
                  <div className ="span6">
                    <h2>Your Information</h2>
                    {
                      !this.props.logged_in &&
                      <SignInPrompt
                        info_icon={this.props.sign_in_prompt_data.info_icon}
                        sign_in_url={this.props.sign_in_prompt_data.sign_in_url}
                      />
                    }
                    <EnrollForm
                      workshop_id={this.props.workshop.id}
                      workshop_course={this.props.workshop.course}
                      logged_in={this.props.logged_in}
                      first_name={this.props.enrollment.first_name}
                      email={this.props.enrollment.email}
                      onSubmissionComplete={this.onSubmissionComplete}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (this.state.submissionStatus === "duplicate") {
      return this.renderDuplicate();
    } else if (this.state.submissionStatus === "own") {
      return this.renderOwn();
    } else if (this.state.submissionStatus === "closed") {
      return this.renderClosed();
    } else if (this.state.submissionStatus === "full") {
      return this.renderFull();
    } else if (this.state.submissionStatus === "not found") {
      return this.renderNotFound();
    } else if (this.state.submissionStatus === "success") {
      return this.renderSuccess();
    }
  }
}
