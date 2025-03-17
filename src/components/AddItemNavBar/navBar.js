import React from "react";
import { Menu, Container, Button, Image } from "semantic-ui-react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../logo.svg";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Menu
        inverted
        borderless
        style={{
          padding: "0",
          marginBottom: "20px",
          minHeight: "40px" /* Reduce the minimum height */,
          height: "80px",
        }}
        attached
      >
        <Container>
          <Menu.Item name="home">
            <Link to="/">
              <Image src={logo} size="tiny" alt="logo" />
            </Link>
          </Menu.Item>
          <Menu.Item>
            <h2 className="text-2xl">React Firebase CRUD with Upload Image</h2>
          </Menu.Item>
          <Menu.Item position="right">
            <Button size="mini" primary onClick={() => navigate("/addItem")}>
              Add Item
            </Button>
          </Menu.Item>
        </Container>
      </Menu>
    </div>
  );
};

export default NavBar;
