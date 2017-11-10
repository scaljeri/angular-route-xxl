import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/combineLatest';

function extractFromRoute(parent, routeProperty, property): Observable<any> | string {
    let retVal;

    while (parent && !retVal) {
        retVal = parent[routeProperty].map(d => d[property]);

        parent = parent.parent;
    }

    return retVal;
}

function injectValue(target, key, routeValues, args, asObservable): void {
    if (asObservable !== false) {
        if (args.length === 1) {
            target[key] = routeValues[0];
        } else {
            target[key] = routeValues.reduce((obj, val, index) => {
                obj[args[index]] = val;

                return obj;
            }, {});
        }
    } else {
        Observable.combineLatest(...routeValues)
            .subscribe(values => {
                target[key] = values;
            });
    }
}

export interface RouteXxlConfig {
    observable?: boolean;
}

export function routeDecoratorFactory(routePropertyName) {
    return function (...args: Array<string | RouteXxlConfig>): any {
        const config = (typeof args[args.length - 1] === 'object' ? args.pop() : {}) as RouteXxlConfig;

        return (target: any, key: string, index: number): void => {
            const ngOnInit = target.ngOnInit;

            if (!args.length) {
                args = [key.replace(/\$$/, '')];
            }

            target.ngOnInit = function (): void {
                const routeValues = [];

                args.forEach((prop, index) => {
                    routeValues[index] = extractFromRoute(this.route, routePropertyName, prop);
                });

                injectValue(target, key, routeValues, args, config.observable);

                this.ngOnInit = ngOnInit;
                if (ngOnInit) {
                    this.ngOnInit();
                }
            };
        };
    };
}
