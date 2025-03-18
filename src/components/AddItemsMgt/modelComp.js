import React from "react";
import { Modal, Header, Button, Image } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";

const ModelComp = ({
  open,
  setOpen,
  item,
  id,
  handleDelete
}) => {
  const navigate = useNavigate();

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Modal.Header>Item: {item.item}</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          {item.image && (
            <Image
              src={item.image || "https://react.semantic-ui.com/images/wireframe/image.png"}
              size="medium"
              centered
              style={{ marginBottom: "20px" }}
            />
          )}
          <p><strong>Item Name:</strong>  {item.item}</p>
          <p><strong>Description:</strong>  {item.description}</p>
          <p><strong>Date:</strong> {item.date}</p>
          <p><strong>Price:</strong>  {item.price}</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Button
          color="red"
          content="Delete"
          labelPosition="right"
          icon="trash"
          onClick={() => handleDelete(id)}
        />
        <Button color="black" onClick={() => setOpen(false)}>
          Close
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ModelComp;
