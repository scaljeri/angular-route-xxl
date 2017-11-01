export const RouteData = function (annotation?: string, useSnapshot?: boolean): any {
    return (target: any, key: string, index: number): void => {
        const ngOnInit = target.ngOnInit;

        target.ngOnInit = function (): void {
            let parent = useSnapshot ? this.route.snapshot : this.route,
                data = null;

            while (parent && !data) {
                const targetKeyName = annotation || key.replace(/\$$/, '');
                if (useSnapshot) {
                    data = parent.data[targetKeyName];
                } else {
                    data = parent.data.map(d => d[targetKeyName]);
                }
                parent = parent.parent;
            }

            target[key] = data;

            delete this.ngOnInit;
            if (ngOnInit) {
                ngOnInit.call(this);
                this.ngOnInit = ngOnInit;
            }
        };
    };
};
