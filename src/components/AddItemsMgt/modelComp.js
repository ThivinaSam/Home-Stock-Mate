import React from 'react'
import { Menu, Container, Button, Image } from 'semantic-ui-react'
import { useNavigate } from 'react-router-dom'
import logo from '../../assets/react.svg'

const modelComp = () => {

    const navigate = useNavigate();

  return (
    <div>
      <Menu inverted borderless style={{padding: "0.3rem", marginBottom: "20px"}} attached>
        <Menu.Item name="home">
            <link to = '/'>
                <Image src={logo} size="mini" alt="logo"/>
            </link>
        </Menu.Item>
        <Menu.Item>
            <h2>React Firebase CRUD with Upload Image</h2>
        </Menu.Item>
        <Menu.Item position="right">
            <Button size="mini" primary onClick={() => navigate("/addItem")}></Button>
        </Menu.Item>
      </Menu>
    </div>
  )
}

export default modelComp
