import logo from "../assets/logo.png";

const Header = () => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-dark "
      style={{ height: "10vh" }}
    >
      <div className="ms-5 d-flex gap-2">
        <div>
          <img
            src={logo}
            alt="logo"
            className="img-fluid"
            style={{ width: "50px", height: "50px" }}
          />
        </div>
        <div>
          <a
            className="navbar-brand text-light fs-2 fw-bold text-center"
            href="#"
          >
            ChatMeet
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
