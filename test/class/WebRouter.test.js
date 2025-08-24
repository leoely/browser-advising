import { describe, expect, test, } from '@jest/globals';
import WebRouter from '~/class/WebRouter';

describe('[Class] WebRouter;', () => {
  test('The WebRouter can correctly extract the corresponding path from the URL', () => {
    const webRouter = new WebRouter({
      threshold: 0.5,
      number: 1,
      bond: 5,
      dutyCycle: 5,
      interception: undefined,
      hideError: true,
    });
    expect(JSON.stringify(webRouter.gain('/login//sam?k1=v1'))).toMatch('{\"queryParams\":{\"k1\":\"v1\"},\"pathVariables\":{}}');
    webRouter.attach('/login', { name: 'login', location: '/login' });
    expect(JSON.stringify(webRouter.gain('/login//sam?k1=v1'))).toMatch('{\"content\":{\"name\":\"login\",\"location\":\"/login\"},\"queryParams\":{\"k1\":\"v1\"},\"pathVariables\":{}}');
    expect(JSON.stringify(webRouter.gain('/fasdfasdf'))).toMatch('{\"queryParams\":{},\"pathVariables\":{}}');
  });

  test('WebRouter should be able to read path variables.', () => {
    const webRouter = new WebRouter({
      threshold: 0.05,
      number: 8,
      bond: 5,
      dutyCycle: 10,
      interception: undefined,
      hideError: true,
    });
    webRouter.attach('/index//{name}', { name: 'index', location: '/index' });
    expect(JSON.stringify(webRouter.gain('/index//sam?k1=v1'))).toMatch('{\"content\":{\"name\":\"index\",\"location\":\"/index\"},\"queryParams\":{\"k1\":\"v1\"},\"pathVariables\":{\"name\":\"sam\"}}');
  });
});
