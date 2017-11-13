import { expect } from 'chai';
import { RouteData } from '../index';
import 'mocha';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import * as chai from 'chai';
import { Observable, Subject } from 'rxjs/Rx'
import 'rxjs/add/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const should = chai.should();
chai.use(sinonChai);

describe.only('RouteData', () => {
    let comp, spy, route, subjects;

    beforeEach(() => {
        subjects = [new BehaviorSubject(null), new BehaviorSubject(null), new BehaviorSubject(null)];

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
        comp = {route: route, ngOnInit: spy};
    });

    it('should exist', () => {
        expect(RouteData).should.exist;
    });

    describe('As observables', () => {
        beforeEach(() => {
            RouteData('bar')(comp, 'bar$', 0);
            RouteData('foo', 'baz')(comp, 'fb$', 0);
            RouteData()(comp, 'moz$', 0);

            comp.ngOnInit();
        });

        it('should have bind all observables', () => {
            should.exist(comp.bar$.subscribe);
            should.exist(comp.fb$.subscribe);
            should.exist(comp.moz$.subscribe);
        });

        it('should have called ngOnInit', () => {
            spy.should.have.been.called;
        });

        it('should have restored ngOnInit', () => {
            comp.ngOnInit.should.equals(spy);
        });

        describe('Root data', () => {
            const bar = {}, fb = {foo: 'foo', baz: 'baz'}, moz = {};

            beforeEach(() => {
                subjects[0].next({bar}); // first route
            });

            describe.only('Propagate updates', () => {
                it('should update the named decorator', () => {
                    comp.bar$.subscribe(data => data.should.equals(bar));
                });

                it('should have no interference with other route updates', () => {
                    subjects[1].next({moz});

                    comp.bar$.subscribe(data => data.should.equals(bar));
                });

                it('should update the multi-named decorator', () => {
                    subjects[0].next(fb);

                    comp.fb$.subscribe(data => data.should.eql(fb));
                });

                it('should update the implicit decorator', () => {
                    subjects[0].next({moz});

                    comp.moz$.subscribe(data => data.should.equals(moz));
                });
            })
        });
    });

    describe('As strings', () => {
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
                const data = [4, 5, 6];

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
