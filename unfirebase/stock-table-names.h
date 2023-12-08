#ifndef UNFIREBASE_STOCK_TABLE_NAMES_H
#define UNFIREBASE_STOCK_TABLE_NAMES_H

#include <string>
#include <unordered_set>

#define stringify(name) #name

const std::unordered_set<std::string> STOCK_TABLE_NAMES = {
    "100 Birds of the World",
    "Aerosol Optical Depth",
    "African American Inventors and Scientists",
    "Air Quality Index by US County",
    "American Ninja Warrior Obstacles",
    "American Sign Language Alphabet",
    "AP Computer Science Test Takers and Demographics, by State (2019)",
    "Baseball Teams",
    "Bechdel Test",
    "Bee Colonies",
    "Best Selling Video Games",
    "Beverages Nutrition",
    "Big Mac Index",
    "Bike and Walk Commutes",
    "Board Games",
    "Artistic Works of Bob Ross",
    "Boston Bike Share Rentals",
    "Boston Surface Temperature - Citizen Scientists",
    "Boston Surface Temperature - Satellite",
    "Busiest Airports",
    "Carbon Dioxide Concentrations",
    "Cats",
    "Cereal Nutrition",
    "College Majors & Income",
    "Countries and Territories",
    "COVID-19 Cases per Country",
    "COVID-19 Cases per US State",
    "Cryptocurrency Historical Prices",
    "Daily Weather",
    "DC Comics Characters",
    "Dinosaur Fossils",
    "Dogs",
    "Endangered Species of Canada",
    "Esports Earnings",
    "Fast Food Nutrition",
    "Female State Legislators",
    "FIFA Men's World Cup Results",
    "FIFA Women's World Cup Results",
    "Global Life Expectancy",
    "Grammy Winners",
    "HBCU Enrollment",
    "Historical Non-violent Resistances",
    "Independence Days Worldwide",
    "100 Influential African Americans (Age 25-45)",
    "International Exhibition of Modern Art 1913",
    "Internet Usage and Access Worldwide",
    "Ivy League Universities",
    "Major US Airlines",
    "MLS Teams",
    "Most Followed Instagram Accounts",
    "Most Spoken Languages of the World",
    "NBA Teams",
    "NCAA Division I Teams",
    "Netflix Content",
    "NFL Teams",
    "NHL Teams",
    "Nobel Prize Winners 1901-2016",
    "NWSL Teams",
    "NYC Public Wifi Locations",
    "New York Times Bestselling Books, 2011-2018",
    "Olympic Medals",
    "Oscar Winners",
    "Ozone and Nitrogen Dioxide Concentrations",
    "Palmer Penguins",
    "Paralympics Medal Count All-Time",
    "Passwords",
    "Periodic Table Elements",
    "Planets of our Solar System",
    "Precipitation Rate",
    "US Presidents",
    "Ramen Ratings",
    "Rollercoasters",
    "Simpsons Guest Stars",
    "States",
    "Target Store Locations",
    "Tate Museum Artworks",
    "Top 200 USA ",
    "Top 200 Worldwide",
    "Top 50 USA",
    "Top 50 Worldwide",
    "Top 500 Music Albums",
    "Ultra Trail Races",
    "US 2016 Presidential Election Results by State",
    "US Agricultural Crops",
    "US Congressional Members",
    "US Gas Prices",
    "US Household Income",
    "US Incarcerated Population, Per Race, Ethnicity, and Region",
    "US National Parks",
    "US Supreme Court Justices",
    "US Voter Registration and Demographics by State",
    "US Women Running for Elected Office in 2020",
    "US Workers with Disabilities",
    "Video Game Reviews from IGN",
    "Viral 50 USA",
    "Viral 50 Worldwide",
    "Volcano Eruptions",
    "WNBA Teams",
    "Women of 2020",
    "2017 Women's March Attendance by US City",
    "Wordle",
    "Words",
    "World Democracy Index",
    "FIFA World Cup 2022",
    "World's Tallest Buildings",
    "World's Tallest Mountains",

    // TODO: add a few stock tables that are probably level data injected by FirebaseStorage.populateTable
    "US States",
    "TheRoot: 100 Influential African Americans",
    //"AP Computer Science Test Takers and Demographics, by State (2019)",
    "AP Computer Science Test Taker Demographics by State (2019)",
    "US Voter Registration and Demographics By State",
    "RollingStone: 500 Albums",
    "College Majors & Incomes",
    "Most Spoken Languages Worldwide",
    "US 2016 Presidential Election Results",

};

#endif