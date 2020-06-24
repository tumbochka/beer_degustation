export interface BeerItem {
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
    plato: number
  },
  "brewery": {
    "brewery_id": number,
    "brewery_name": string,
    "brewery_slug": string,
    "brewery_label": string,
    "country_name": string,
  }
}

export interface Degustation {
  title: string,
  date: Date,
  beers: Array<BeerItem>
}
