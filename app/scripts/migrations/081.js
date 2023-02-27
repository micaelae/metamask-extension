import { cloneDeep } from 'lodash';
import { v4 } from 'uuid';

const version = 81;

/**
 * Migrate the frequentRpcListDetail from the PreferencesController to the NetworkController, convert it from an array to an object
 * keyed by random uuids, and update property `nickname` to `chainName`.
 */
export default {
  version,
  async migrate(originalVersionedData) {
    const versionedData = cloneDeep(originalVersionedData);
    versionedData.meta.version = version;
    const state = versionedData.data;
    const newState = transformState(state);
    versionedData.data = newState;
    return versionedData;
  },
};

function transformState(state) {
  const { PreferencesController, NetworkController } = state || {};

  if (
    !PreferencesController ||
    PreferencesController.frequentRpcListDetail === undefined
  ) {
    return {
      ...state,
      NetworkController: {
        ...NetworkController,
        networkConfigurations: {
          ...NetworkController?.networkConfigurations,
        },
      },
    };
  }

  const { frequentRpcListDetail = [] } = PreferencesController || {};

  const networkConfigurations = {};
  frequentRpcListDetail.forEach(
    ({ rpcUrl, chainId, ticker, nickname, rpcPrefs }) => {
      const networkConfigurationId = v4();
      networkConfigurations[networkConfigurationId] = {
        rpcUrl,
        chainId,
        ticker,
        rpcPrefs,
        chainName: nickname,
      };
    },
  );

  delete PreferencesController.frequentRpcListDetail;

  return {
    ...state,
    NetworkController: {
      ...NetworkController,
      networkConfigurations,
    },
    PreferencesController: {
      ...PreferencesController,
    },
  };
}
