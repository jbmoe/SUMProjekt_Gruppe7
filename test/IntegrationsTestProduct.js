require('should');
const request = require('supertest');
const controller = require("../controller/controller");
const app = require('../app.js');
const { response } = require ('../app.js');


//Integrations test af order
describe('integration test - promise', function () {
    
    it("get('/') test", function (){
        return request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/);
    });



    it("post('/product') test", async () => {
        let response = await request(app)
            .post('/api/products')
            .send({
                'name' : 'testProduct',
                'price' : 50,
                'category' : 'testCategory'
            })
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .expect(200);
        response = await controller.getProducts(); 
        response.length.should.be.greaterThanOrEqual(1);
        response[response.length - 1].name.should.be.equal('testProduct')
        response[response.length - 1].price.should.be.equal(50)
        response[response.length - 1].category.should.be.equal('testCategory')
    });
    

    it("get('/product') test", async () => {
        let response = await request(app)
            .get('/api/products')
            .expect(200)
            .expect('Content-Type', /json/);
        response.body.length.should.be.greaterThanOrEqual(1); 
        
    });
});

