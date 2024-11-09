import Image from "../assets/logo.png";
import HeroImage from "../assets/hero2.png";
import world from "../assets/worldmap.png";
import { MdOutlineVideoChat } from "react-icons/md";
import { NavLink } from "react-router-dom";

function Home() {
  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-light"
        style={{ backgroundColor: "#A69ECC" }}
      >
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <img
              src={Image}
              alt="ChatMeet Logo"
              className="img-fluid"
              style={{ width: "50px", height: "50px" }}
            />
            <span className="ms-2 fs-3 fw-bold" style={{ color: "purple" }}>
              ChatMeet
            </span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a
                  className="nav-link active fs-5 text-light pe-5 fw-semibold"
                  href="#"
                >
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link fs-5 text-light pe-5 fw-semibold"
                  href="#"
                >
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link fs-5 text-light fw-semibold" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section
        className="container-fluid text-center d-flex align-items-center justify-content-around flex-column flex-md-row"
        style={{
          backgroundColor: "#A69ECC",
          height: "auto",
        }}
      >
        <div className="order-1 order-md-1 col-md-6">
          <img
            src={HeroImage}
            alt="Hero"
            className="img-fluid mb-4 mb-md-0"
            style={{ maxWidth: "100%", height: "95vh" }}
          />
        </div>
        <div className="order-2 order-md-2 col-md-6 d-flex flex-column align-items-center justify-content-center text-light p-3">
          <h1 className="display-4 fw-bold mb-3 " style={{ color: "cyan" }}>
            Your next chat could be special-why wait?
          </h1>
          <p className="fs-4 p-2 ">
            ChatMeet lets you video call random strangers, giving you the chance
            to make new friends, find love, and more – all in one place.
          </p>
          <NavLink to="/chat">
            <button className="btn btn-primary btn-lg  p-4 fs-4 fw-semibold text-decoration-none">
              <MdOutlineVideoChat size={30} /> Start Video Chat
            </button>
          </NavLink>
        </div>
      </section>

      <section className="container-fluid p-5 bg-light shadow-sm text-dark text-center ">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <img
              src={world}
              alt="World map"
              className="img-fluid"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
          <div className="col-md-6">
            <h2>Connect with Strangers Online</h2>
            <p className="fs-4 pt-3">
              ChatMeet is a platform that brings people together for real-time
              conversations and video interactions, making it easy to connect
              instantly with others from around the world. It’s a place to meet
              new friends, exchange ideas, and share moments that matter, all
              from the comfort of your screen.
            </p>
          </div>
        </div>
      </section>

      <footer
        className="text-light py-4"
        style={{ backgroundColor: "#2C2C2C" }}
      >
        <div className="container text-center">
          <div className="row">
            <div className="col-md-6 mb-3 mb-md-0">
              <h5>ChatMeet</h5>
              <p>
                Connecting people instantly through real-time chat and video.
              </p>
            </div>
            <div className="col-md-6">
              <h5>Contact Us</h5>
              <p>Email: chatmeet@gmail.com</p>
            </div>
          </div>
          <hr className="bg-light" />
          <p>&copy; 2024 ChatMeet. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;
