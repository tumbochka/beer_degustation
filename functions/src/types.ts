export interface Rate {
  user: string,
  rate: number,
  shout: string
}

export interface BeerItem {
  id: string,
  checkin_count: number,
  volume: number,
  picture: string,
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
  id: string,
  title: string,
  date: Date,
  avatar: string,
  location: string,
  beers: Array<BeerItem>,
  users: Array<string>,
  leading: string|null,
}
