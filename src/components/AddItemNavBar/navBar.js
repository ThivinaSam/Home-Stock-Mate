import React, { useState } from "react";
import { Menu, Header, Button, Container } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import AddItemModal from "../AddItemsMgt/AddEditItemModal";

const NavBar = ({ refreshItems }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Menu size="large" inverted style={{ margin: 0 }}>
        {/* Use a customized Container with less padding */}
        <Container style={{ width: '80%', maxWidth: '1400px', padding: '0 10px' }}>
          <Menu.Item style={{ paddingLeft: '0' }}>
            <Header as="h3" inverted style={{ marginRight: '5px' }}>
              {/* Home Stock Mate */}
            </Header>
          </Menu.Item>

          {/* <Menu.Item name="Home" onClick={() => navigate("/addItemHome")} /> */}

          {/* Spacer item - takes up available space */}
          <Menu.Item style={{ flex: 1 }}></Menu.Item>

          {/* Right-aligned items in correct order */}
          <Menu.Menu position="right">
            <Menu.Item onClick={() => navigate("/")}>
              Go to Dashboard
            </Menu.Item>
            
            <Menu.Item style={{ paddingRight: '0' }}>
              <Button primary onClick={() => setOpen(true)}>
                Add Item
              </Button>
            </Menu.Item>
          </Menu.Menu>
        </Container>
      </Menu>

      {/* Add the modal component */}
      <AddItemModal open={open} setOpen={setOpen} refreshItems={refreshItems} />
    </>
  );
};

export default NavBar;
