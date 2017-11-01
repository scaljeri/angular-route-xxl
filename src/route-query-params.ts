export const RouteQueryParams = function (annotation?: any, useSnapshot?: boolean): any {
    return (target: any, key: string, index: number): void => {
        const ngOnInit = target.ngOnInit;

        target.ngOnInit = function (): void {
            let parent = useSnapshot ? this.route.snapshot : this.route,
                queryParams = null;

            while (parent && !queryParams) {
                const targetKeyName = annotation || key.replace(/\$$/, '');
                if (useSnapshot) {
                    queryParams = parent.queryParams[targetKeyName];
                } else {
                    queryParams = parent.queryParams.map(d => d[targetKeyName]);
                }
                parent = parent.parent;
            }

            target[key] = queryParams;

            delete this.ngOnInit;
            if (ngOnInit) {
                ngOnInit.call(this);
                target.ngOnInit = ngOnInit;
            }
        };
    };
};
