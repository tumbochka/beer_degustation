import React, {useState} from "react";
import {Form, Button, Col, Row} from "react-bootstrap";

const AddBeer = () => {
    return(
   <div>
       <Form>
        <Form.Label column sm="2">
            brewery_name
        </Form.Label>
        <Form.Label column sm="2">
            beer_name
        </Form.Label>
        <Form.Label column sm="2">
            beer_abv
        </Form.Label>
        <Form.Label column sm="2">
            beer_ibu
        </Form.Label>
        <Form.Label column sm="2">
            volume
        </Form.Label>
        <Form.Label column sm="2">
            plato
        </Form.Label>
        <Form.Label column sm="2">
            beer_style
        </Form.Label>
    </Form>
   </div>)}
