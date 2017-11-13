import { routeDecoratorFactory } from '../src/route-decorators';

import { specs as dataParamSpecs } from './route-data-params.spec';
import { specs as queryParamSpecs } from './route-query-params.spec';

dataParamSpecs(routeDecoratorFactory('data'), 'data');
dataParamSpecs(routeDecoratorFactory('params'), 'params');
queryParamSpecs(routeDecoratorFactory('queryParams'));
