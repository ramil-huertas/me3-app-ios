import types from '../Action/types';

const intialState = {
    loading: false,
    mainData: null,
    totalAssets: '',
    totalAssetsToCompare: 0,

};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.GET_TOTAL_ASSETS_API_START: {
            return {
                ...state,
                loading: true,
            };
        }
        case types.GET_TOTAL_ASSETS_API_FINISH: {
            return {
                ...state,
                loading: false,
                mainData: action.payload.mainData,
                totalAssets: action.payload.totalAsset,
                totalAssetsToCompare: action.payload.totalAssetToCompare,
            };
        }
        case types.RESET_STATE: {
            return {
                loading: false,
                mainData: null,
                totalAssets: '',
                totalAssetsToCompare: 0,
            };
        }
        default: {
            return state;
        }
    }
};
