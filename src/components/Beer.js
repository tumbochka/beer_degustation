import React from "react";
import {Row, Col, Button, OverlayTrigger, Tooltip} from "react-bootstrap";

const Beer = ({
    beer,
    onClick,
    onClickCaption
  }) => {
  const renderTooltip = (props) => {
    return (
      <Tooltip id={"tooltip" + beer.id} {...props}>
        {beer.beer.beer_description}
      </Tooltip>
    );
  }
  return (
    <Row key={beer.id} >
      <Col>
        {beer.beer.beer_label ?
          <img src={beer.beer.beer_label} alt='Beer label'/> :
          ''
        }
      </Col><Col>
        {beer.beer.bid}
      </Col><Col>
        {beer.brewery.brewery_name}
      </Col><Col>
        {beer.beer.beer_name}
      </Col><Col>
        {beer.beer.beer_style}
      </Col><Col>
        {beer.beer.beer_abv}
      </Col><Col>
        {beer.beer.beer_ibu}
      </Col><Col xs={2}>
      <OverlayTrigger
        key={"overlay" + beer.id}
        placement="left"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}
      >
        <div>
        {beer.beer.beer_description ? beer.beer.beer_description.substring(0, 50) + '...' : ''}
        </div>
      </OverlayTrigger>
      </Col>
      {onClick ?
        <Col>
          <Button onClick={onClick}>{onClickCaption}</Button>
        </Col>
        : ''
      }
    </Row>
  );
}

export default Beer;
