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

    it("get('/product') test", async () => {
        let response = await request(app)
            .get('/api/products')
            .expect(200)
            .expect('Content-Type', /json/);
        response.body.length.should.be.greaterThanOrEqual(1); 
        
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
        response.length.should.be.greaterThanOrEqual(2);
        response[response.length - 1].name.should.be.equal('testProduct')
        response[response.length - 1].price.should.be.equal(50)
        response[response.length - 1].category.should.be.equal('testCategory')
    });
    

    
    // it('should return status 200 after DELETING a product', function(done) {
    //     return request
    //     .delete('/api/products/' + 'testProduct')
    //     .end(function(err, res){
    //         if(err) {
    //             throw err;
    //         }
    //         res.should.have.status(200);
    //         done(); 
    //     });
    // });
});

