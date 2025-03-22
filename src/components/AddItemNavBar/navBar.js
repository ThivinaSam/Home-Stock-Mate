import React, { useState } from "react";
import { Menu, Button, Container, Image } from "semantic-ui-react";
import { useNavigate, Link } from "react-router-dom";
import AddItemModal from "../AddItemsMgt/AddEditItemModal"; // Make sure this path is correct
// import logo from "../../assets/logo.png"; // Ensure the logo path is correct

const NavBar = ({ refreshItems }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <Menu
        inverted
        borderless
        style={{
          padding: "0",
          marginBottom: "20px",
          minHeight: "40px",
          height: "80px",
        }}
        attached
      >
        <Container>
          <Menu.Item name="home">
            <Link to="/">
              <Image size="tiny" alt="logo" />
            </Link>
          </Menu.Item>
          <Menu.Item>
            <h2 className="text-2xl">React Firebase CRUD with Upload Image</h2>
          </Menu.Item>
          <Menu.Item position="right">
            <Button size="mini" primary onClick={() => navigate("/addItem")}>
              Add Item
            </Button>
            <Button size="mini" primary onClick={() => navigate("/addItem")}>
              Get Item
            </Button>
          </Menu.Item>

          <Menu.Item style={{ flex: 1 }}></Menu.Item>

          <Menu.Menu position="right">
            <Menu.Item onClick={() => navigate("/")}>
              Go to Dashboard
            </Menu.Item>
            <Menu.Item style={{ paddingRight: "0" }}>
              <Button primary onClick={() => setOpen(true)}>Add Item</Button>
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>

      {/* Add Item Modal */}
      <AddItemModal open={open} setOpen={setOpen} refreshItems={refreshItems} />
    </div>
  );
};

export default NavBar;
