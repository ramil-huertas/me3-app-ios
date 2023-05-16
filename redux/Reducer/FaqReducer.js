import types from '../Action/types';
import { logger } from '@constants/Log';

const intialState = {
    loading: false,
    faqList:[],
    detailsLoading:false,
    faqDetails:{}
};

export default (state = intialState, action) => {
    switch (action.type) {
        case types.GET_FAQ_LIST_START: {
            logger('currency', action);
            return {
                ...state,
                loading:true,
            };
        }

        case types.GET_FAQ_LIST_FINISH: {
            return {
                ...state,
                loading:false,
                faqList:action.payload.faqData
            };
        }

        case types.RESET_FAQ_STATE:{
            return {
                ...state,
                faqList:[],
                detailsLoading:false,
                faqDetails:{}
            }
        }
        default: {
            return state;
        }
    }
};
