const {Builder, By} = require('selenium-webdriver');

async function test_1() {
    let driver = await new Builder().forBrowser('chrome').build();
    await driver.get('http://localhost:8081/#/broker/test');
    let price = null;
    let start_balance = null;
    let end_balance = null;

    setTimeout(async () => {
        start_balance = await driver.findElement(By.xpath("//h2[@id='balance']")).getText()
        start_balance = Number(start_balance.split(" ")[2].split("$")[0])
        console.log('start')
    }, 3000)



    setTimeout(async () => {
        await driver.findElement(By.xpath("//input[@id='2_buy_inp']")).sendKeys(1)
        console.log("inp")
    }, 5000)



    setTimeout(async () => {
        console.log("inp1")
        await driver.findElement(By.xpath("//button[@id='2_buy_confirm_btn']")).click()
        price = await driver.findElement(By.xpath("/html/body/div/div/div[3]/div[2]/div/div/p")).getText()
        price = Number(price.split("$")[1])
        console.log('confirm', price)
    }, 6000)

    setTimeout(async () => {
        end_balance = await driver.findElement(By.xpath("//h2[@id='balance']")).getText()
        end_balance = Number(end_balance.split(" ")[2].split("$")[0])
        console.log(start_balance)
        console.log(price)
        console.log(end_balance)

        console.log(parseFloat(start_balance - price).toFixed(1), " vs ", parseFloat(end_balance).toFixed(1))
        if(parseFloat(end_balance).toFixed(1)*100/100 === (parseFloat(start_balance).toFixed(1)-parseFloat(price).toFixed(1))*100/100){
            console.log("balance right")
        }
    }, 10000)
}


test_1();