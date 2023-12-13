<script>

import {mapState} from "vuex";

export default {
  name: "AdminPage",

  data() {
    return {
      brokers: null,
      stocks: null
    };
  },

  async beforeCreate(){
    this.brokers = await fetch('http://localhost:8080/brokers').then(res => res.json());

    this.stocks = await fetch("http://localhost:8080/stocks").then(res => res.json());
  },


  mounted() {
    this.$socket.on("buy", (data) => {
      let broker = JSON.parse(data)
      for (let i = 0; i < this.brokers.length; i++) {
        if (this.brokers[i].id === broker.id){
          this.brokers[i] = broker
        }
      }
    })

    this.$socket.on("sell", (data) => {
      let broker = JSON.parse(data)
      for (let i = 0; i < this.brokers.length; i++) {
        if (this.brokers[i].id === broker.id){
          this.brokers[i] = broker
        }
      }
    })
  },

  methods: {

    getDifference(broker, stock) {
      const stockPrice = Number(stock.data[stock.data?.length-1-this.$store.state.index]?.Open.slice(1)) * broker.stocks[stock.id]?.count;
      const brokerSum = broker.stocks[stock.id]?.sum;
      let difference = (stockPrice - brokerSum).toFixed(2)
      return !isNaN(difference) ? difference : 0
    }
  },

  computed: {
    ...mapState(["tradingArray"]),
    ...mapState(["index"]),
  },
}

</script>

<template>
  <div class="AdminPage">
    <div class="navigation">
      <router-link :to="{ name: 'BrokerPage', params: { id: this.$route.params.id } }" class="Link">Страница брокера</router-link>
      <router-link class="Link" to="/login">Выход с биржи</router-link>
    </div>
    <div v-for="broker of brokers" v-bind:key = broker.id class="brokerCard">
      <div class="brokerInfo">
        <p>{{broker.name}}</p>
        <p>Баланс: {{Number(broker.balance).toFixed(2)}}$</p>
        <div v-for="stock of stocks" v-bind:key = stock.id>
          <div v-if="broker.stocks !== undefined && broker.stocks[stock.id] !== undefined && broker.stocks[stock.id].count" class="brokerStock">
            <div class="rows">
              <p class="company">Компания: {{ stock.name }}</p>
            </div>
            <div class="rows">
              <p class="count">Количество: {{ broker.stocks[stock.id].count }}</p>
            </div>
            <div v-if="getDifference(broker, stock) > 0"  class="rows">
              <p class="more">+{{ getDifference(broker, stock) }}$</p>
            </div>
            <div v-else class="rows">
              <p class="less">{{ getDifference(broker, stock) }}$</p>
            </div>
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

.AdminPage {
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

.brokerCard {
  margin: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #6495ED;
  text-align: center;
}

.brokerInfo {
  margin-bottom: 10px;
  font-size: 20px;
  color: white;
}

.brokerInfo p {
  margin-bottom: 5px;
}

.brokerStock {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: white;

}

.more {
  margin-bottom: 5px;
  color: #4caf50;
}

.count,
.company{
  color: black;
}

.less {
  margin-bottom: 5px;
  color: #f44336;
}
</style>