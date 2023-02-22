const { strict: assert } = require('assert');
const { convertToHexValue, withFixtures } = require('../helpers');
const FixtureBuilder = require('../fixture-builder');
const {
  ACTION_QUEUE_METRICS_E2E_TEST,
} = require('../../../shared/constants/test-flags');
const { EVENT, EVENT_NAMES } = require('../../../shared/constants/metametrics');

const PRIVATE_KEY =
  '0x7C9529A67102755B7E6102D6D950AC5D5863C98713805CEC576B945B15B71EAC';
const generateETHBalance = (eth) => convertToHexValue(eth * 10 ** 18);
const defaultGanacheOptions = {
  accounts: [{ secretKey: PRIVATE_KEY, balance: generateETHBalance(25) }],
};

describe('MV3 - Service worker restart', function () {
  let windowHandles;

  it.skip('should continue to add new a account if service worker restarts immediately', async function () {
    const numberOfSegmentRequests = 2;

    async function mockSegment(mockServer) {
      mockServer.reset();
      await mockServer.forAnyRequest().thenPassThrough();
      return await mockServer
        .forPost('https://api.segment.io/v1/batch')
        .withJsonBodyIncluding({
          batch: [{ event: EVENT_NAMES.SERVICE_WORKER_RESTARTED }],
        })
        .times(numberOfSegmentRequests)
        .thenCallback(() => {
          return {
            statusCode: 200,
          };
        });
    }

    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withMetaMetricsController({
            metaMetricsId: 'fake-metrics-id',
            participateInMetaMetrics: true,
          })
          .withAppStateController({
            [ACTION_QUEUE_METRICS_E2E_TEST]: false,
          })
          .build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test.title,
        // because of segment
        failOnConsoleError: false,
      },
      async ({ driver, mockServer }) => {
        const mockedSegmentEndpoints = await mockSegment(mockServer);

        await driver.navigate();

        // unlock wallet
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        // open the account menu
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement({ text: 'Create account', tag: 'div' });

        await driver.fill('.new-account-create-form__input', 'Test Account');

        await driver.openNewPage('chrome://inspect/#service-workers/');
        await driver.clickElement({
          text: 'Service workers',
          tag: 'button',
        });

        await driver.clickElement({
          text: 'terminate',
          tag: 'span',
        });

        windowHandles = await driver.getAllWindowHandles();
        const extension = windowHandles[0];
        await driver.switchToWindow(extension);

        await driver.clickElement({ text: 'Create', tag: 'button' });

        await driver.waitForSelector('[id*="password"]', { timeout: 20_000 });

        // unlock wallet
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        // assert that the segment request has been sent through inspecting the mock
        await driver.wait(async () => {
          const isPending = await mockedSegmentEndpoints.isPending();
          return isPending === false;
        }, 10_000);
        const mockedRequests = await mockedSegmentEndpoints.getSeenRequests();

        assert.equal(mockedRequests.length, numberOfSegmentRequests);

        assert.equal(mockedRequests[0].url, 'https://api.segment.io/v1/batch');
        assert.equal(mockedRequests[0].body.json.batch.length, 1);
        assert.equal(
          mockedRequests[0].body.json.batch[0].event,
          EVENT_NAMES.SERVICE_WORKER_RESTARTED,
        );

        assert.deepStrictEqual(
          mockedRequests[0].body.json.batch[0].properties,
          {
            service_worker_action_queue_methods: [],
            category: EVENT.SOURCE.SERVICE_WORKERS,
            chain_id: convertToHexValue(1337),
            environment_type: 'background',
            locale: 'en',
          },
        );

        assert.equal(mockedRequests[1].url, 'https://api.segment.io/v1/batch');
        assert.equal(mockedRequests[1].body.json.batch.length, 1);
        assert.equal(
          mockedRequests[1].body.json.batch[0].event,
          EVENT_NAMES.SERVICE_WORKER_RESTARTED,
        );

        assert.deepStrictEqual(
          mockedRequests[1].body.json.batch[0].properties,
          {
            service_worker_action_queue_methods: ['addNewAccount'],
            category: EVENT.SOURCE.SERVICE_WORKERS,
            chain_id: convertToHexValue(1337),
            environment_type: 'background',
            locale: 'en',
          },
        );
      },
    );
  });

  it('should continue to add new a account when service worker can not restart immediately', async function () {
    const numberOfSegmentRequests = 2;

    async function mockSegment(mockServer) {
      mockServer.reset();
      await mockServer.forAnyRequest().thenPassThrough();
      return await mockServer
        .forPost('https://api.segment.io/v1/batch')
        .withJsonBodyIncluding({
          batch: [{ event: EVENT_NAMES.SERVICE_WORKER_RESTARTED }],
        })
        .times(numberOfSegmentRequests)
        .thenCallback(() => {
          return {
            statusCode: 200,
          };
        });
    }

    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder()
          .withMetaMetricsController({
            metaMetricsId: 'fake-metrics-id',
            participateInMetaMetrics: true,
          })
          .withAppStateController({
            [ACTION_QUEUE_METRICS_E2E_TEST]: true,
          })
          .build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test.title,
        // because of segment
        failOnConsoleError: false,
      },
      async ({ driver, mockServer }) => {
        const mockedSegmentEndpoints = await mockSegment(mockServer);

        await driver.navigate();

        // unlock wallet
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        // open the account menu
        await driver.clickElement('[data-testid="account-menu-icon"]');
        await driver.clickElement({ text: 'Create account', tag: 'div' });

        await driver.fill('.new-account-create-form__input', 'Test Account');

        await driver.clickElement({ text: 'Create', tag: 'button' });

        await driver.openNewPage('chrome://inspect/#service-workers/');
        await driver.clickElement({
          text: 'Service workers',
          tag: 'button',
        });

        await driver.clickElement({
          text: 'terminate',
          tag: 'span',
        });

        windowHandles = await driver.getAllWindowHandles();
        const extension = windowHandles[0];
        await driver.switchToWindow(extension);

        await driver.waitForSelector('[id*="password"]', { timeout: 20_000 });

        // unlock wallet
        await driver.fill('#password', 'correct horse battery staple');
        await driver.press('#password', driver.Key.ENTER);

        // assert that the segment request has been sent through inspecting the mock
        await driver.wait(async () => {
          const isPending = await mockedSegmentEndpoints.isPending();
          return isPending === false;
        }, 20_000);
        const mockedRequests = await mockedSegmentEndpoints.getSeenRequests();

        assert.equal(mockedRequests.length, numberOfSegmentRequests);

        assert.equal(mockedRequests[0].url, 'https://api.segment.io/v1/batch');
        assert.equal(mockedRequests[0].body.json.batch.length, 1);
        assert.equal(
          mockedRequests[0].body.json.batch[0].event,
          EVENT_NAMES.SERVICE_WORKER_RESTARTED,
        );

        assert.deepStrictEqual(
          mockedRequests[0].body.json.batch[0].properties,
          {
            service_worker_action_queue_methods: [],
            category: EVENT.SOURCE.SERVICE_WORKERS,
            chain_id: convertToHexValue(1337),
            environment_type: 'background',
            locale: 'en',
          },
        );

        assert.equal(mockedRequests[1].url, 'https://api.segment.io/v1/batch');
        assert.equal(mockedRequests[1].body.json.batch.length, 1);
        assert.equal(
          mockedRequests[1].body.json.batch[0].event,
          EVENT_NAMES.SERVICE_WORKER_RESTARTED,
        );

        assert.deepStrictEqual(
          mockedRequests[1].body.json.batch[0].properties,
          {
            service_worker_action_queue_methods: ['addNewAccount'],
            category: EVENT.SOURCE.SERVICE_WORKERS,
            chain_id: convertToHexValue(1337),
            environment_type: 'background',
            locale: 'en',
          },
        );
      },
    );
  });
});
