import React from "react";
import {Row, Col, Button, OverlayTrigger, Tooltip} from "react-bootstrap";

const Beer = ({
    beer,
    user,
    // onClick,
    // onClickCaption
    buttons,
  }) => {
    const renderButtons = () => {
        return buttons.map(
            button => {
                return <Col>
                    <Button onClick={button.onClick}>{button.onClickCaption}</Button>
            </Col>
            }
       )
    }
    let currentRate = null, avg = 0;
    if(beer.rates && beer.rates.length) {
        const rate = beer.rates.find(rateItem => rateItem.user === user.uid);
        if(rate) {
            currentRate = rate;
        }
        avg = (beer.rates.map(rate=>rate.rate).reduce(((a, b) => a+Number(b)), 0)) / beer.rates.length;
    }
  const renderTooltip = (props) => {
    return (
      <Tooltip id={"tooltip" + beer.id} {...props}>
        {beer.beer.beer_description}
      </Tooltip>
    );
  }

    const renderShout = (props) => {
        return(
        <Tooltip id={"shout" + beer.id} {...props}>
            { currentRate && currentRate.shout ? currentRate.shout : '--'}
        </Tooltip>
        )
    }
  return (
    <Row key={beer.id}  xs={11} sm={11} md={11} lg={11} xl={11} >
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
      </Col><Col>
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
        <Col>
            <OverlayTrigger
                key={"shout" + beer.id}
                placement="left"
                delay={{ show: 250, hide: 400 }}
                overlay={renderShout}
            >
                <div>
                    {currentRate ? currentRate.rate : '--'}
                </div>
            </OverlayTrigger>
        </Col>
        <Col>
            {currentRate ? avg : '--'}
        </Col>
      {renderButtons() }
    </Row>
  );
}

export default Beer;
