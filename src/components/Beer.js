import React from "react";
import {Row, Col, Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {DEGUSTATION_TYPE_EDIT} from "./Degustation";

const Beer = ({
    beer,
    user,
    // onClick,
    // onClickCaption
    buttons,
  mode
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
    <Row key={beer.id}  className='row-cols-10'>
      <Col className="colLabel">
          <img
            className="beerLabel"
            src={beer.beer.beer_label ? beer.beer.beer_label : 'https://untappd.akamaized.net/site/assets/images/temp/badge-beer-default.png'}
            alt='Beer label'
          />
      </Col>
      {DEGUSTATION_TYPE_EDIT === mode ? <Col>
        {beer.beer.bid}
      </Col> : ''}

      <Col className="colWrap">
        {beer.brewery.brewery_name}
      </Col>
        <Col className="colWrap">
        {beer.beer.beer_name}
      </Col><Col className="colWrap">
        {beer.beer.beer_style}
      </Col><Col>
        {beer.beer.beer_abv} <br/> {beer.beer.beer_ibu}
      </Col><Col className="colWrap">
      <OverlayTrigger
        key={"overlay" + beer.id}
        placement="left"
        delay={{ show: 250, hide: 400 }}
        overlay={renderTooltip}
      >
        <div>
        {beer.beer.beer_description ? beer.beer.beer_description.substring(0, 40) + ' ...' : ''}
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
                    /
                    {currentRate ? Math.round(avg * 100)/100 : '--'}
                </div>
            </OverlayTrigger>
        </Col>
      {renderButtons() }
    </Row>
  );
}

export default Beer;
