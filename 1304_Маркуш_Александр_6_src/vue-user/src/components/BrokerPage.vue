<script>
import {mapState} from "vuex";

import {Line} from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement)

export default {
  name: 'BrokerPAge',
  components: { Line },

  data() {
    return {
      stocks: null,
      broker: null,
      graphics: {},
      showBuyDialog: null,
      showSellDialog: null,
      buyingErrors: {},
      sellErrors: {},
      stockCounts: {}
    };
  },

  async beforeCreate() {
    console.log(this.$route.params.id)
   this.broker =  await fetch("http://localhost:8080/brokers/" + this.$route.params.id)
       .then(res => (res.json()));
    console.log(this.broker)


    await fetch("http://localhost:8080/stocks")
        .then(res => {
          res.json().then(result => {
            this.stocks = result
            this.stocks.forEach(stock => {
              this.graphics[stock.id] = false;
            })
          })
        });
  },

  mounted() {
    this.$socket.on("trading", (data) => {
      this.$store.commit("setIndex", JSON.parse(data))
    })
    this.$socket.on("tradingList", (data) => {
      this.$store.commit("setTradingArray", JSON.parse(data).listTradings)
    })
    this.$socket.on("broker_buy", (data) => {
      console.log(data)
      let broker = JSON.parse(data)
      if (this.broker.id == broker.id) {
        this.broker = broker
      }
    })
    this.$socket.on("broker_sell", (data) => {
      let broker = JSON.parse(data)
      if (this.broker.id == broker.id) {
        this.broker = broker
      }
    })
  },

  computed: {
    ...mapState(["tradingArray"]),
    ...mapState(["index"]),
  },

  methods: {
    toggleGraphic(stock_id) {
      this.graphics[stock_id] = !this.graphics[stock_id]
    },


    clearError(stockId) {
      this.buyingErrors[stockId] = false;
      this.sellErrors[stockId] = false;
    },

    buy(stock_id) {
      const stock = this.stocks.find(stock => stock.id === stock_id);
      const stockPrice = Number(stock.data[stock.data.length - 1 - this.$store.state.index]?.Open.slice(1));
      if (this.broker.balance >= stockPrice * this.stockCounts[stock_id] && this.stockCounts[stock_id] > 0) {
        this.buyingErrors[stock_id] = false;
        const data = {
          "price": stockPrice,
          "broker_id": this.broker.id,
          "stock_id": stock_id,
          "stock_count": this.stockCounts[stock_id]
        };
        this.$socket.emit("buy", data);
      } else {
        this.buyingErrors[stock_id] = true;
      }
    },

    sell(stock_id) {
      if(this.stockCounts[stock_id] > 0) {
        const stock = this.stocks.find(stock => stock.id === stock_id);
        const stockPrice = Number(stock.data[stock.data.length - 1 - this.$store.state.index]?.Open.slice(1));
        if (this.broker.stocks[stock_id].count >= this.stockCounts[stock_id]) {
          this.error = false;
          const data = {
            "price": stockPrice,
            "broker_id": this.broker.id,
            "stock_id": stock_id,
            "stock_count": this.stockCounts[stock_id]
          };
          this.$socket.emit("sell", data);
        } else {
          this.sellErrors[stock_id] = true;
        }
      } else{
        this.sellErrors[stock_id] = true;
      }
    },

    getDifference(broker, stock) {
      const stockPrice = Number(stock.data[stock.data?.length-1-this.$store.state.index]?.Open.slice(1)) * broker.stocks[stock.id]?.count;
      const brokerSum = broker.stocks[stock.id]?.sum;
      let difference = (stockPrice - brokerSum).toFixed(2)
      return !isNaN(difference) ? difference : 0
    }
  }


}

</script>

<template>
  <div class="BrokerPage">

      <div class="navigation">
        <router-link :to="{ name: 'AdminPage', params: { id: this.$route.params.id } }" class="Link">Страница администратора</router-link>
        <router-link class="Link" to="/login">Выход с биржи</router-link>
    </div>
<div class="Info">
  <div v-if="broker" class="BrokerInfo">
      <h1 class="name">Имя брокера: {{ broker.name }}</h1>
      <h2 class="balance" id="balance">Счет брокера: {{ Number(broker.balance).toFixed(1) }}$</h2>
    </div>

    <h2 v-if="stocks" class="Date">Дата тогров: {{ stocks[0].data[stocks[0]?.data.length-1-this.$store.state.index]?.Date }}</h2>
    <h2 v-else class="Date">Дата: {{ new Date().toLocaleDateString("en-US") }}</h2>
</div>

    <div v-if="broker && stocks" class="stocks">
      <div v-for="stock in stocks" v-bind:key="stock.id" class="Stock">
        <div v-if="this.$store.state.tradingArray.includes(stock.id)">
          <div class="current-stock">
            <h1>{{ stock.id }}</h1>
            <h3>{{ stock.name }}</h3>
            <p class="Price" v-bind:id="stock.id+'_price'">
              {{ stock.data[stock.data.length-1-this.$store.state.index]?.Open }}
            </p>
            <p v-if="broker.stocks !== undefined && broker.stocks[stock.id] !== undefined && broker.stocks[stock.id].count" class="count">
              Ваши акции: {{ broker.stocks[stock.id].count }}
            </p>
            <div v-if="broker.stocks !== undefined && broker.stocks[stock.id] !== undefined && broker.stocks[stock.id].count">
            <div v-if="getDifference(broker, stock) > 0"  class="rows">
              <p class="more">+{{ getDifference(broker, stock) }}$</p>
            </div>
            <div v-else class="rows">
              <p class="less">{{ getDifference(broker, stock) }}$</p>
            </div>
          </div>
            <input class="input"
                v-bind:id="stock.id+'_buy_inp'"
                type="number"
                v-model="stockCounts[stock.id]"
                @input="clearError(stock.id)"
                :class="{ 'error': buyingErrors[stock.id] || sellErrors[stock.id] }"
            />
            <p v-if="buyingErrors[stock.id]" class="error-message">Операция невозможна. Недостаточно средств.</p>
            <p v-if="sellErrors[stock.id]" class="error-message">Операция невозможна. Недостаточно акций.</p>
            <div class="buttons">
              <button class="buyButton" v-if="tradingArray.includes(stock.id)" v-bind:id="stock.id+'_buy_confirm_btn'" v-on:click="buy(stock.id)">
                Купить
              </button>
              <button class="sellButton" v-if="tradingArray.includes(stock.id)" v-bind:id="stock.id+'_sell_confirm_btn'" v-on:click="sell(stock.id)">
                Продать
              </button>
              <button class="graphicButton" @click="toggleGraphic(stock.id)">График</button>
            </div>
          </div>
          <div v-if="graphics[stock.id]" class="Graphic">
            <Line
                id="chart"
                :options="{
                            responsive: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: stock.id
                                },
                            },
                        }"
                :data="{
                            title: stock.id,
                            labels: stock.data.map((data) => data.Date).slice(stock.data.length-1-this.$store.state.index, stock.data.length-1).reverse(),
                            datasets: [{
                                data: stock.data.map((data) =>data.Open.slice(1)).slice(stock.data.length-1-this.$store.state.index, stock.data.length-1).reverse(),
                                borderColor: 'rgb(244, 164, 96)',
                                label: 'price',
                                pointRadius: 0.6,
                                borderWidth: 1,
                            }]
                        }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<style>
body{
  margin: 0;
}

.BrokerPage{
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.Link{
  text-decoration: none;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  background: #555;
}

.navigation{
  background: #333;
  padding: 10px;
  display: flex;
  justify-content: space-around;
  width: 100%;
  border-radius: 10px;
  margin: 0 0 10px 0;
  font-size: 20px;
}

a{
  color: black;
  padding: 10px 0 10px 0;
}

.BrokerInfo{
  display: flex;
  flex-direction: column;
  align-items: center;

}
.Info{
  border-radius: 10px;
  display: flex;
  background-color: #45a049;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
.current-stock{
  border-radius: 10px;
  display: flex;
  border: 2px solid #45a049;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 20px 0 20px 0;
}

#chart{
  height: 700px;
  width: 700px;
}
.input {
  margin: 5px;
  border-radius: 5px;
  padding: 5px;
}

.buyButton,
.sellButton,
.graphicButton{
  margin: 5px;
  border-radius: 5px;
  border: 2px solid #45a049;
}

.buyButton:hover,
.sellButton:hover,
.graphicButton:hover{
  background: #6495ED;
}
</style>