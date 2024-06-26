import React, { useState, useEffect, useContext } from "react";
import UserContext from "../../context/UserContext";
import { TextField, Container, Grid, Box, Card } from "@material-ui/core/";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import LineChart from "../Template/LineChart";
import BarChart from "./BarChart";
import Copyright from "../Template/Copyright";
import styles from "./Search.module.css";
import Axios from "axios";
import InfoCard from "./InfoCard";
import PriceCard from "./PriceCard";
import PurchaseCard from "./PurchaseCard";
import PurchaseModal from "./PurchaseModal";
import config from "../../config/Config";

// Create a filter for Autocomplete
const filter = createFilterOptions();

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    marginBottom: "40px",
  },
}));

// Component for rendering the LineChart within a Card
const LineChartCard = ({ pastDataPeriod, stockInfo, duration }) => {
  return (
    <Grid
      item
      xs={12}
      sm={7}
      component={Card}
      className={styles.card}
      style={{ minHeight: "350px" }}
    >
      <LineChart
        pastDataPeriod={pastDataPeriod}
        stockInfo={stockInfo}
        duration={duration}
      />
    </Grid>
  );
};

// Component for rendering the BarChart within a Card
const BarChartCard = ({ sixMonthAverages, stockInfo }) => {
  return (
    <Grid item xs={12} sm component={Card} className={styles.card}>
      <BarChart sixMonthAverages={sixMonthAverages} stockInfo={stockInfo} />
    </Grid>
  );
};

// Component for rendering stock information, charts, and purchase-related components
const StockCard = ({ setPurchasedStocks, purchasedStocks, currentStock }) => {
  const { userData } = useContext(UserContext);
  const [selected, setSelected] = useState(false);
  const [stockInfo, setStockInfo] = useState(undefined);
  const [sixMonthAverages, setSixMonthAverages] = useState(undefined);
  const [pastDay, setPastDay] = useState(undefined);
  const [pastMonth, setPastMonth] = useState(undefined);
  const [pastTwoYears, setPastTwoYears] = useState(undefined);

  useEffect(() => {
    // Fetch detailed stock information
    const getInfo = async () => {
      const url = config.base_url + `/api/data/prices/${currentStock.ticker}`;
      const response = await Axios.get(url);
      if (response.data.status === "success") {
        setStockInfo(response.data.data);
      }
    };

    // Fetch historical data for the selected stock
    const getData = async () => {
      const url =
        config.base_url + `/api/data/prices/${currentStock.ticker}/full`;
      const response = await Axios.get(url);
      if (response.data.status === "success") {
        setSixMonthAverages(response.data.sixMonthAverages);
        setPastDay(response.data.pastDay);
        setPastMonth(response.data.pastMonth);
        setPastTwoYears(response.data.pastTwoYears);
      }
    };

    getInfo();
    getData();
  }, []);

  return (
    <div className={styles.root}>
      {stockInfo && pastDay && (
        <InfoCard stockInfo={stockInfo} price={pastDay.adjClose} />
      )}
      {sixMonthAverages && pastDay && pastMonth && pastTwoYears && (
        <div>
          <Grid container spacing={3}>
            <LineChartCard
              pastDataPeriod={pastTwoYears}
              stockInfo={stockInfo}
              duration={"2 years"}
            />
            <BarChartCard
              sixMonthAverages={sixMonthAverages}
              stockInfo={stockInfo}
            />
          </Grid>
          <PriceCard pastDay={pastDay} />
          <Grid container spacing={3}>
            <PurchaseCard
              setSelected={setSelected}
              balance={userData.user.balance}
            />
            <LineChartCard
              pastDataPeriod={pastMonth}
              stockInfo={stockInfo}
              duration={"month"}
            />
          </Grid>
          <Box pt={4}>
            <Copyright />
          </Box>
          {selected && (
            <PurchaseModal
              stockInfo={stockInfo}
              pastDay={pastDay}
              setSelected={setSelected}
              setPurchasedStocks={setPurchasedStocks}
              purchasedStocks={purchasedStocks}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Component for the stock search functionality
const Search = ({ setPurchasedStocks, purchasedStocks }) => {
  const classes = useStyles();
  const [value, setValue] = useState(null);
  const [currentStock, setCurrentStock] = useState(null);

  // Handle the change in the search bar
  const onSearchChange = (event, newValue) => {
    setValue(newValue);
    if (newValue) {
      setCurrentStock(newValue);
    } else {
      setCurrentStock(null);
    }
  };

  return (
    <Container className={classes.addMargin}>
      <Autocomplete
        value={value}
        onChange={onSearchChange}
        filterOptions={(options, params) => {
          let filtered = filter(options, params);
          if (currentStock) {
            filtered = filtered.slice(0, 4);
          }
          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        id="stock-search-bar"
        options={stocks}
        getOptionLabel={(option) => option.name}
        renderOption={(option) => option.name}
        style={{
          maxWidth: "700px",
          margin: "30px auto",
          marginBottom: "60px",
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for a stock"
            variant="outlined"
          />
        )}
      />
      {currentStock && (
        <StockCard
          setPurchasedStocks={setPurchasedStocks}
          purchasedStocks={purchasedStocks}
          currentStock={currentStock}
        />
      )}
      <br />
      <br />
      <br />
    </Container>
  );
};

// Sample stock data
const stocks = [
  { name: "Tesla Inc", ticker: "TSLA" },
  { name: "Meta Platforms Inc", ticker: "FB" },
  { name: "Netflix Inc", ticker: "NFLX" },
  { name: "PayPal Holdings Inc", ticker: "PYPL" },
  { name: "Alibaba Group Holding Ltd", ticker: "BABA" },
  { name: "Visa Inc", ticker: "V" },
  { name: "Johnson & Johnson", ticker: "JNJ" },
  { name: "The Walt Disney Company", ticker: "DIS" },
  { name: "General Electric Co", ticker: "GE" },
  { name: "Procter & Gamble Company", ticker: "PG" },
  { name: "McDonald's Corp", ticker: "MCD" },
  { name: "The Home Depot Inc", ticker: "HD" },
  { name: "Cisco Systems Inc", ticker: "CSCO" },
  { name: "Goldman Sachs Group Inc", ticker: "GS" },
  { name: "Intel Corp", ticker: "INTC" }
  // Add more stock data as needed
];

export default Search;
