// store.js — singleton eventState store for counter app
import { createEventState } from '@uistate/core';

const initial = {
  count: 0
};

const store = createEventState(initial);
export default store;
