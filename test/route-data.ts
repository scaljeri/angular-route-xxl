import { expect } from 'chai';
import { RouteData } from '../index';
import 'mocha';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as chai from 'chai';
import { Observable } from 'rxjs/Rx'
import 'rxjs/add/observable/of';

const should = chai.should();
chai.use(sinonChai);

describe('RouteData', () => {
    let comp, spy;

    beforeEach(() => {
        spy = sinon.spy();

        comp = {ngOnInit: spy};
    });

    it('should exist', () => {
        expect(RouteData).should.exist;
    });

    describe('One parent', () => {
        let stream$ = Observable.of({contacts: {id: 1}});

        beforeEach(() => {
            comp.route = {
                data: stream$
            };

            RouteData('contacts')(comp, 'data$', 0);
            comp.ngOnInit();
        });

        it('should have found the data', (done) => {
            comp.data$.subscribe(val => {
                val.should.eql({id: 1});
                done();
            });
        });

        it('should have called ngOnInit', () => {
            spy.should.have.been.called;
        });

        it('should have restored ngOnInit', () => {
            comp.ngOnInit.should.equals(spy);
        });
    });

    describe.only('Nested parents', () => {
        beforeEach(() => {
            let data = {map: cb => cb({})};

            comp.route = {
                data,
                parent: {
                    data,
                    parent: {
                        data: {map: cb => cb({contacts: {}})}
                    }
                }
            };

            RouteData('contacts')(comp, 'data$', 0);
            comp.ngOnInit();
        });

        it('should have found the data', () => {
            should.exist(comp.data$);
        });

        it('should have called ngOnInit', () => {
            spy.should.have.been.called;
        });

        it('should have restored ngOnInit', () => {
            comp.ngOnInit.should.equals(spy);
        });
    });

    describe('Without ngOnInit', () => {
        beforeEach(() => {
            delete comp.ngOnInit;
            comp.route = {data: {map: cb => cb({contacts: {}})}};

            RouteData('contacts')(comp, 'contacts$', 0);
        });

        it('should have created ngOnInit', () => {
            comp.ngOnInit.should.exist;
        });

        it('should inject the data', () => {
            comp.ngOnInit();

            comp.contacts$.should.exist;
        });

        it('should remove the fake ngOnInit', () => {
            comp.ngOnInit();

            should.not.exist(comp.ngOnInit);
        });
    });

    describe('Without params', () => {
        beforeEach(() => {
            comp.route = {
                data: {map: cb => cb({contacts: {}})}
            };

            RouteData()(comp, 'contacts$', 0);
            comp.ngOnInit();
        });

        it('should have set the data', () => {
            comp.contacts$.should.exist;
        });
    });

    describe('With { observable: false }', () => {
        beforeEach(() => {
            comp.route = {
                data: Observable.of({contactId: '123'})
            };

            RouteData('contactId', {observable: false})(comp, 'contactId', 0);
            comp.ngOnInit();
        });

        it('should have found the contact id', () => {
            should.exist(comp.contactId);
        });

        it('should have correct value for contact id', () => {
            should.equal(comp.contactId, '123');
        })
    });
});
