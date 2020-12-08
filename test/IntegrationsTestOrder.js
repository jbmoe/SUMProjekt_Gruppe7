require('should');
const request = require('supertest');
const controller = require("../controller/controller");
const app = require('../app.js');
const { response } = require ('../app.js');
const { post } = require('../routes/order');

//Integrationstest af order 
describe('integration test - promise', function () {

    before(function() {
        
    })

    it("get('/') test", function (){
        return request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/);
    });

    it("post('/order') test", async () => {
        let response = await request(app)
            .post('/bestilling')
            .send({
                'orderID' : 'testOrder2',
                'time' : 1234,
                'table' : 'testTable',
                'waiter' : 'testWaiter',
                'products' : 'product1',
                'price' : 100
            })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200);
        response.body.message.should.be.equal('Order saved!')
        response = await controller.getOrders()
        response.length.should.be.greaterThanOrEqual(1);
        response[response.length - 1].time.should.be.equal(1234);
        response[response.length - 1].table.should.be.equal('testTable');
        response[response.length - 1].waiter.should.be.equal('testWaiter');
        response[response.length - 1].products.length.should.be.greaterThanOrEqual(1);
        response[response.length - 1].price.should.be.equal(100);
    });

       //Get orders virker så længe der ikke bliver tjekket på session i order.js i routes (linje 26)
       it("get('/orders') test", async () => {
        let response = await request(app)
            .get('/bestilling/api')
            .expect(200)
            .expect('Content-Type', /json/);
        response.body.length.should.be.greaterThanOrEqual(1); 
    });
})

