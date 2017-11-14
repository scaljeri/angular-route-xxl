import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { combineLatest } from 'rxjs/observable/combineLatest';

function extractRoutes(parent, routeProperty): Observable<any>[] {
    let routes = [];

    while (parent) {
        routes.push(parent[routeProperty]);

        parent = parent.parent;
    }

    return routes;
}

function extractValues(routes, args, config, cb): void {
    const stream$ = combineLatest(of(null), ...routes, (...routeValues) => {
            const values = routeValues.reduce((obj, route) => {
                args.forEach(arg => {
                    if (route && route[arg] !== undefined) {
                        obj[arg] = route[arg];
                    }
                });

                return obj;
            }, {});

            return args.length === 1 ? values[args[0]] : values;
        });

    if (config.observable === false) {
        stream$.subscribe(cb);
    } else {
        cb(stream$);
    }
}

export interface RouteXxlConfig {
    observable?: boolean;
}

export function routeDecoratorFactory(routeProperty) {
    return function (...args: Array<string | RouteXxlConfig>): any {
        const config = (typeof args[args.length - 1] === 'object' ? args.pop() : {}) as RouteXxlConfig;

        return (target: any, key: string, index: number): void => {
            const ngOnInit = target.ngOnInit;

            if (!args.length) {
                args = [key.replace(/\$$/, '')];
            }

            target.ngOnInit = function (): void {
                if (!this.route) {
                    throw(`${target.constructor.name} uses the ${routeProperty} @decorator without a 'route' property`);
                }

                const routes = routeProperty === 'queryParams' ? [this.route.queryParams] : extractRoutes(this.route, routeProperty);

                extractValues(routes, args, config, values => {
                    this[key] = values;
                });

                this.ngOnInit = ngOnInit;
                if (ngOnInit) {
                    this.ngOnInit();
                }
            };
        };
    };
}
