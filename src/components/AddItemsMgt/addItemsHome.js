import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  Button,
  Card,
  Grid,
  Container,
  Image,
  Table,
  Loader,
} from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";

const AddItemsHome = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    const unsub = onSnapshot(
      collection(db, "addItems"),
      (snapshot) => {
        let list = [];
        snapshot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setItems(list);
        setLoading(false);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, []);

  return (
    //  <div>car</div>

    <Container>
      <Card.Group>
        <Grid columns={3} stackable>
          {items &&
            items.map((item) => (
              <Grid.Column key={item.id}>
                <Card>
                  <Card.Content>
                    <Image
                      src={item.image}
                      size="medium"
                      style={{
                        height: "150px",
                        width: "150px",
                        borderRadius: "50%",
                      }}
                    />
                    <Card.Header style={{ marginTop: "10px" }}>
                      {item.item}
                    </Card.Header>
                    <Card.Description>{item.description}</Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <div>
                      <Button
                        color="green"
                        onClick={() => navigate(`/update/${item.id}`)}
                      >
                        Update
                      </Button>
                      <Button color="purple">View</Button>
                    </div>
                  </Card.Content>
                </Card>
              </Grid.Column>
            ))}
        </Grid>
      </Card.Group>
    </Container>

    // <Container>
    //   {loading ? (
    //     <Loader active inline="centered" />
    //   ) : (
    //     <Table celled>
    //       <Table.Header>
    //         <Table.Row>
    //           <Table.HeaderCell>Image</Table.HeaderCell>
    //           <Table.HeaderCell>Name</Table.HeaderCell>
    //           <Table.HeaderCell>Description</Table.HeaderCell>
    //           <Table.HeaderCell>Date</Table.HeaderCell>
    //           <Table.HeaderCell>Price</Table.HeaderCell>
    //           <Table.HeaderCell>Actions</Table.HeaderCell>
    //         </Table.Row>
    //       </Table.Header>

    //       <Table.Body>
    //         {items &&
    //           items.map((item) => (
    //             <Table.Row key={item.id}>
    //               <Table.Cell>
    //                 <Image
    //                   src={
    //                     item.image ||
    //                     "https://react.semantic-ui.com/images/wireframe/image.png"
    //                   }
    //                   size="tiny"
    //                   circular
    //                   style={{ width: "50px", height: "50px" }}
    //                 />
    //               </Table.Cell>
    //               <Table.Cell>{item.item}</Table.Cell>
    //               <Table.Cell>{item.description}</Table.Cell>
    //               <Table.Cell>{item.date}</Table.Cell>
    //               <Table.Cell>{item.price}</Table.Cell>
    //               <Table.Cell>
    //                 <Button
    //                   color="green"
    //                   onClick={() => navigate(`/update/${item.id}`)}
    //                 >
    //                   Update
    //                 </Button>
    //                 <Button color="purple">View</Button>
    //               </Table.Cell>
    //             </Table.Row>
    //           ))}
    //       </Table.Body>
    //     </Table>
    //   )}
    // </Container>
  );
};

export default AddItemsHome;
