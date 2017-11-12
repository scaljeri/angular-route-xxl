import { expect } from 'chai';
import { RouteData } from '../index';
import 'mocha';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as chai from 'chai';
import { Observable, Subject } from 'rxjs/Rx'
import 'rxjs/add/observable/of';

const should = chai.should();
chai.use(sinonChai);

describe.only('RouteData', () => {
    let comp, spy, route,
        contacts = {},
        subjects = [new Subject(), new Subject(), new Subject()];


    beforeEach(() => {
        route = {
            data: subjects[0].asObservable(),
            parent: {
                data: subjects[1].asObservable(),
                parent: {
                    data: subjects[2].asObservable(),
                }
            }
        };

        spy = sinon.spy();
        comp = {ngOnInit: spy};
        comp.route = route;
    });

    it('should exist', () => {
        expect(RouteData).should.exist;
    });

    describe('Observables', () => {
        beforeEach(() => {
            RouteData('bar')(comp, 'bar$', 0);
            RouteData('foo', 'baz')(comp, 'foo$', 0);
            RouteData()(comp, 'moz$', 0);

            comp.ngOnInit();
        });

        it('should not have a value set yet', () => {
            should.not.exist(comp.contacts);
        });

        it('should have called ngOnInit', () => {
            spy.should.have.been.called;
        });

        it('should have restored ngOnInit', () => {
            comp.ngOnInit.should.equals(spy);
        });
    });

    describe('Strings', () => {
        beforeEach(() => {
            RouteData('bar', {observable: false})(comp, 'bar$', 0);
            RouteData('foo', 'moz', {observable: false})(comp, 'foo$', 0);
            RouteData({observable: false})(comp, 'baz$', 0);

            comp.ngOnInit();
        });

        it('should not have a value set yet', () => {
            should.not.exist(comp.contacts);
        });
    });



    describe('Zero nested parents', () => {
        beforeEach(() => {
            subjects[0].next({contacts}); // first route
        });

        it('should have set the data on the component', () => {
            comp.contacts.should.equals(contacts);
        });
    });

    describe('Multiple nested parents', () => {
        beforeEach(() => {
            RouteData('fooId')(comp, 'x$', 0);
            RouteData('barId')(comp, 'y$', 0);
            RouteData('bazId')(comp, 'z$', 0);
            comp.ngOnInit();
        });

        it('should have set the observables', () => {
            comp.x$.should.be.instanceOf(Observable);
            comp.y$.should.be.instanceOf(Observable);
            comp.z$.should.be.instanceOf(Observable);
        });

        it('should resolve the current route', (done) => {
            comp.x$.subscribe(data => {
                data.should.equals(1);
                done();
            });
        });

        it('should resolve the first parent', (done) => {
            comp.y$.subscribe(data => {
                data.should.equals(2);
                done();
            });
        });

        it('should resolve the second parent', (done) => {
            comp.z$.subscribe(data => {
                data.should.equals(3);
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

    describe('Without ngOnInit', () => {
        let stream$ = Observable.of({contacts: {id: 1}});

        beforeEach(() => {
            comp.route = {data: stream$};
            delete comp.ngOnInit;

            RouteData('contacts')(comp, 'contacts$', 0);
        });

        it('should have created ngOnInit', () => {
            comp.ngOnInit.should.exist;
        });

        it('should remove the fake ngOnInit', () => {
            comp.ngOnInit();

            should.not.exist(comp.ngOnInit);
        });
    });

    describe('With { observable: false }', () => {
        const subject = new Subject();

        beforeEach(() => {
            comp.route = {
                data: subject.asObservable()
            };

            RouteData('contacts', {observable: false})(comp, 'contacts');
            comp.ngOnInit();
        });

        it('should initially be undefined', () => {
            should.not.exist(comp.contacts);
        });

        describe('After init', () => {
            const data = [1, 2, 3];

            beforeEach(() => {
                subject.next({contacts: data, item: {id: 9}});
            });

            it('should update on change', () => {
                comp.contacts.should.equals(data);
            });

            describe('On change', () => {
                const data = [4,5,6];

                beforeEach(() => {
                    subject.next({contacts: data, item: {id: 9}});
                });

                it('should update on change', () => {
                    comp.contacts.should.equals(data);
                });
            });
        });
    });
});
