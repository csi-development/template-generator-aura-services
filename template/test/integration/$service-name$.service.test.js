/*
 #  Project: chaise                                                            #
 #  File: \tests\unit_test.js                                                  #
 #                                                                             #
 #  Author: Sylvain (contact@cashsystemes.eu)                                  #
 #  Modified By: Sylvain (contact@cashsystemes.eu>)                            #
 #                                                                             #
 #  File Created: Monday, 24th June 2019 10:45:20 am                           #
 #  Last Modified: Saturday, 27th July 2019 1:36:00 pm                         #
 #                                                                             #
 #  Copyright 2018 - 2019, Cash Systemes Industries                            #
 */

 const chai = require('chai');
 const chaiHttp = require('chai-http');
 const should = chai.should();
 chai.use(chaiHttp);
 
 // console.log(process.env)
 
 let server
 
 try {
     // REGEX for ip in string
     let r = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
     let app_name = process.env.APP_NAME || 'chaise'
     let app_ingress_ip = process.env.HUDSON_URL.match(r)[0] || '192.168.30.244';
     let app_env = process.env.KUBE_ENVIRONMENT || 'jx-staging'
     server = `http://${app_name}.${app_env}.${app_ingress_ip}.nip.io`
 
 } catch (error) {
     server = `http://localhost:3000`
 }
 
 
 
 
 
 /*
  * Test the API
  */
 describe('TEST DU CRUD $service-name$', () => {
     let _id = null
     let data = {
         champs1: "value1",
         champs2: "value2"
     }
 
 
 
     it('Health method', done => {
        chai.request(server)
            .get('/api/$service-name$')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('boolean').eql(true)
                done();
            });
    });


     it('Create method on Alias', done => {
 
         chai.request(server)
             .post('/api/$service-name$')
             .send(data)
             .end((err, res) => {
                 res.should.have.status(200);
                 res.body.should.be.a('object');
                 res.body.should.have.property('champs1').eql(data.champs1);
                 res.body.should.have.property('champs2').eql(data.champs2);
                 res.body.should.have.property('_id').to.be.a('string');
                 _id = res.body._id
                 done();
             });
     });
 
 
 
 
     it('List method on Alias', done => {
         chai.request(server)
             .get('/api/$service-name$')
             .end((err, res) => {
                 res.should.have.status(200);
                 res.body.should.be.a('object');
                 res.body.should.have.property('rows').to.be.a('array');
                 res.body.should.have.property('total').to.be.a('number');
                 res.body.should.have.property('page').to.be.a('number');
                 res.body.should.have.property('pageSize').to.be.a('number');
                 res.body.should.have.property('totalPages').to.be.a('number');
                 done();
             });
     });
 
 
 
 
     it('find method on Alias', done => {
         chai.request(server)
             .get('/api/$service-name$/' + _id)
             .end((err, res) => {
                 res.should.have.status(200);
                 res.body.should.be.a('object');
                 res.body.should.have.property('champs1').eql(data.champs1);
                 res.body.should.have.property('champs2').eql(data.champs2);
                 res.body.should.have.property('_id').eql(_id)
                 done();
             });
     });
 
 
 
     it('Delete method on Alias', done => {
         chai.request(server)
             .delete('/api/$service-name$/' + _id)
             .end((err, res) => {
                 res.should.have.status(200);
                 res.body.should.be.a('object');
                 res.body.should.have.property('champs1').eql(data.champs1);
                 res.body.should.have.property('champs2').eql(data.champs2);
                 res.body.should.have.property('_id').eql(_id)
                 done();
             });
     });
 
 
 
 
 
 
 });