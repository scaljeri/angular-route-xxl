export const RouteParams = function (annotation?: any, useSnapshot?: boolean): any {
    return (target: any, key: string, index: number): void => {
        const ngOnInit = target.ngOnInit;

        target.ngOnInit = function (): void {
            let parent = useSnapshot ? this.route.snapshot : this.route,
                params = null;

            while (parent && !params) {
                const targetKeyName = annotation || key.replace(/\$$/, '');
                if (useSnapshot) {
                    params = parent.params[targetKeyName];
                } else {
                    params = parent.params.map(d => d[targetKeyName]);
                }
                parent = parent.parent;
            }

            target[key] = params;

            delete this.ngOnInit;
            if (ngOnInit) {
                ngOnInit.call(this);
                target.ngOnInit = ngOnInit;
            }
        };
    };
};
