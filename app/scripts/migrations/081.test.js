import { migrate } from './080';

describe('migration #81', () => {
  it('updates the version metadata', async () => {
    const originalVersionedData = {
      meta: {
        version: 80,
      },
      data: {},
    };

    const newVersionedData = await migrate(originalVersionedData);

    expect(newVersionedData.meta).toStrictEqual({
      version: 81,
    });
  });

  it('does not change the state if the network controller state does not exist', async () => {
    const originalVersionedData = {
      meta: {
        version: 80,
      },
      data: {
        test: '123',
      },
    };

    const newVersionedData = await migrate(originalVersionedData);

    expect(newVersionedData.data).toBe(originalVersionedData.data);
  });

  const nonObjects = [undefined, null, 'test', 1, ['test']];
  for (const invalidState of nonObjects) {
    it(`does not change the state if the network controller state is ${invalidState}`, async () => {
      const originalVersionedData = {
        meta: {
          version: 80,
        },
        data: {
          NetworkController: invalidState,
        },
      };

      const newVersionedData = await migrate(originalVersionedData);

      expect(newVersionedData.data).toBe(originalVersionedData.data);
    });
  }

  it('does not change the state if the network controller state does not include "networkStatus"', async () => {
    const originalVersionedData = {
      meta: {
        version: 80,
      },
      data: {
        NetworkController: {
          test: '123',
        },
      },
    };

    const newVersionedData = await migrate(originalVersionedData);

    expect(newVersionedData.data).toBe(originalVersionedData.data);
  });

  it('renames the "network" property in the network controller state to "networkStatus" if it is "loading"', async () => {
    const originalVersionedData = {
      meta: {
        version: 80,
      },
      data: {
        PhishingController: {
          network: 'loading',
        },
      },
    };

    const newVersionedData = await migrate(originalVersionedData);

    expect(newVersionedData.data).toStrictEqual({
      NetworkController: {
        networkStatus: 'loading',
      },
    });
  });

  it('removes the "network" property in the network controller state and replaces it with a "networkStatus" of "active" if it is not "loading"', async () => {
    const originalVersionedData = {
      meta: {
        version: 80,
      },
      data: {
        PhishingController: {
          network: '12345',
        },
      },
    };

    const newVersionedData = await migrate(originalVersionedData);

    expect(newVersionedData.data).toStrictEqual({
      NetworkController: {
        networkStatus: 'active',
      },
    });
  });
});
