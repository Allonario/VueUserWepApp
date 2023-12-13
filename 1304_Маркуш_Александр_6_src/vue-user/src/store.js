import {createStore} from 'vuex'
export default createStore({
    state() {
        return {
            tradingArray: [],
            index: 0,
        }
    },
    mutations: {
        setTradingArray(state, array){
            state.tradingArray = array;
        },

        setIndex(state, newIndex) {
            state.index = newIndex;
        },
    }
})