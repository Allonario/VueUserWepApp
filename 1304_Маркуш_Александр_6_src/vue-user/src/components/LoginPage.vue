<template>
  <div class="LoginPage">
    <div class="loginDiv">
      <p>Вход</p>
      <p>Выберите имя брокера</p>
      <select class="brokersSelect" v-model="selected_broker">
        <option v-for="broker of brokers" :key="broker.name" :value="broker.name">{{ broker.name }}</option>
      </select>
      <button class="loginButton" @click="login">Войти</button>
    </div>
  </div>
</template>

<script>
import router from '@/router';

export default {
  name: 'LoginPage',

  data() {
    return {
      brokers: null,
      selected_broker: null
    };
  },

  created() {
    this.fetchBrokers();
  },

  methods: {
    async fetchBrokers() {
      this.brokers = await fetch('http://localhost:8080/brokers').then(res => res.json());
    },

    login() {
      console.log("login");
      if (this.selected_broker) {
        console.log(this.selected_broker);
        router.push({ path: `/broker/${this.selected_broker}` });
      }
    }
  }
}
</script>

<style>
.LoginPage {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
}

.loginDiv {
  margin: 0 auto;
  padding: 20px;
  border: 2px solid #6495ED;
  border-radius: 10px;
  background: #45a049;
  text-align: center;
  font-size: 25px;
}

.loginDiv p {
  margin-bottom: 10px;
}

.brokersSelect {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
}

.loginButton {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-size: 20px;
  cursor: pointer;
}

.loginButton:hover {
  background-color: #6495ED;
}
</style>
