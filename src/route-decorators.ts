import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';

function extractRoutes(parent, routeProperty): Observable<any>[] {
    let routes = [];

    while (parent) {
        routes.push(parent[routeProperty]);

        parent = parent.parent;
    }

    return routes;
}

function extractValues(routes, args, config, cb): void {
    const stream$ = Observable.combineLatest(...routes, function () {
        const values = [].reduce.call(arguments, (obj, route) => {
            args.forEach(arg => {
                if (route[arg] !== undefined) {
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
                const routes = extractRoutes(this.route, routeProperty);

                extractValues(routes, args, config, values => {
                    target[key] = values;
                });

                this.ngOnInit = ngOnInit;
                if (ngOnInit) {
                    this.ngOnInit();
                }
            };
        };
    };
}
