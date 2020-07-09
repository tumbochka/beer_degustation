export interface Rate {
  user: string,
  rate: number
}

export interface BeerItem {
  id: string,
  checkin_count: number,
  volume: number,
  beer: {
    bid: number,
    beer_name: string,
    beer_label: string,
    beer_abv: number,
    beer_ibu: number,
    beer_description: string,
    beer_style: string,
    rating: number,
    plato: number,
    rating_score: number
  },
  brewery: {
    brewery_id: number,
    brewery_name: string,
    brewery_slug: string,
    brewery_label: string,
    country_name: string,
  },
  rates: Array<Rate>
}

export interface Degustation {
  title: string,
  date: Date,
  beers: Array<BeerItem>
}
