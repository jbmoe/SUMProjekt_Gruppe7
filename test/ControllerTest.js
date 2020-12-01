require('should');
const request = require('supertest');
const controller = require("../controller/controller");
let tid = 1234; 

//test af Controller test funktioner
describe('controller test - promise', function () {
    

    it('createProduct() test', async () => {
        let product = await controller.createProduct('testCreateProduct', 100, 'testProductCategory');
        product.name.should.be.equal('testCreateProduct');
        product.price.should.be.equal(100);
        product.category.should.be.equal('testProductCategory');
    });

    it('updateProduct() test', async () => {
        let product1 = await controller.createProduct('name', 150, 'category')
        let id = product1._id
        await controller.updateProduct(id, 'name1', 200, 'category1')
        let product = await controller.getProduct(id)
        product.name.should.be.equal('name1')
        product.price.should.be.equal(200)
        product.category.should.be.equal('category1')
    })


    it('deleteProduct() test', async () => {
        let product2 = await controller.createProduct('testDeleteProduct', 150, 'testDeleteProduct')
        let id = product2._id
        await controller.deleteProduct(id); 
        product2 = await controller.getProduct(id); 
        should.equal(product2, null)
    })

    it('getProducts() test', async () => {
        let products = await controller.getProducts(); 
        products.length.should.be.greaterThanOrEqual(1); 
        products[products.length-1].name.should.be.equal('name1');
        products[products.length-1].price.should.be.equal(200);
        products[products.length-1].category.should.be.equal('category1');
    });

    it('createOrder() test', async () => {
        let order = await controller.createOrder(tid, '1', 'Kim', 'test1', 100, 'testComment')
        order.time.should.be.equal(tid);
        order.table.should.be.equal('1');
        order.waiter.should.be.equal('Kim'); 
        order.products.should.be.equal('test1')
        order.price.should.be.equal(100);
        order.comment.should.be.equal('testComment')
    });

    it('updateOrder() test', async () => {
        let order1 = await controller.createOrder(tid, '1', 'John', 'test2', 200, 'testComment')
        let id = order1._id
        await controller.updateOrder(id, 'test3', 250, 'testComment2')
        let order = await controller.getOrder(id)
        order.time.should.be.equal(tid)
        order.table.should.be.equal('1')
        order.waiter.should.be.equal('John')
        order.products.should.be.equal('test3')
        order.price.should.be.equal(250)
        order.comment.should.be.equal('testComment2')
        

    })

    it('deleteOrder() test', async () => {
        let order2 = await controller.createOrder(tid, '2', 'Lars', 'test1', 150, 'testComment')
        let id = order2._id
        await controller.deleteOrder(id)
        order2 = await controller.getOrder(id)
        should.equal(order2, null)
    })

    it('getOrders() test', async () => {
        let orders = await controller.getOrders(); 
        orders[orders.length-1].time.should.be.equal(tid);
        orders[orders.length-1].table.should.be.equal('1');
        orders[orders.length-1].waiter.should.be.equal('John');
        orders[orders.length-1].products.length.should.be.greaterThanOrEqual(1); 
        orders[orders.length-1].price.should.be.equal(250); 
        orders[orders.length-1].comment.should.be.equal('testComment2')
    });


    it('createUser() test', async () => {
        let user = await controller.createUser('Ulrik', 'password', true)
        user.username.should.be.equal('Ulrik')
        user.password.should.be.equal('password')
        user.admin.should.be.equal(true)
    });

    it('updateUser() test', async () => {
        let user1 = await controller.createUser('Per', 'password', true)
        let id = user1._id
        await controller.updateUser(id, 'Per2', 'password2', false)
        let user = await controller.getUser(id)
        user.username.should.be.equal('Per2')
        user.password.should.be.equal('password2')
        user.admin.should.be.equal(false)
    })


    it('deleteUser() test', async () => {
        let user2 = await controller.createUser('Rasmus', 'password', false)
        let id = user2._id
        console.log(user2)
        await controller.deleteUser(id)
        user2 = await controller.getUser(id)
        should.equal(user2, null)
    })

    it('getUsers() test', async () => {
        let users = await controller.getUsers();
        users[users.length-1].username.should.be.equal('Per2')
        users[users.length-1].password.should.be.equal('password2')
        users[users.length-1].admin.should.be.equal(false)
    })


});